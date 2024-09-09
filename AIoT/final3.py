import torch
import cv2
import Jetson.GPIO as GPIO
from models.common import DetectMultiBackend
from utils.general import (non_max_suppression, scale_coords)
from utils.torch_utils import select_device
import time
import threading

# 서보모터 핀 설정
SERVO_PIN = 32
GPIO.setmode(GPIO.BOARD)
GPIO.setup(SERVO_PIN, GPIO.OUT)
servo = GPIO.PWM(SERVO_PIN, 50)  # 50Hz 주파수
servo.start(0)

# 클래스 집합 정의
required_classes = {'hardhat', 'goggels', 'mask'}
restricted_classes = {'no_hat', 'no_goggels', 'no_mask'}

# 모델 로드 함수
def load_model(weights_path, device=None):
    if torch.cuda.is_available():
        device = '0'  # 첫 번째 GPU 사용
    else:
        device = 'cpu'
    
    print(f"Using device: {device}")
    device = select_device(device)
    model = DetectMultiBackend(weights_path, device=device)
    return model

# 서보모터 제어 함수
def move_servo(angle):
    duty_cycle = 8 if angle == 90 else 12  # 90도 또는 0도에 따라 듀티 사이클 설정
    servo.ChangeDutyCycle(duty_cycle)
    time.sleep(1)  # 서보모터가 움직일 시간을 주기

# 객체 탐지 함수
def detect_objects(model, frame):
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    img = torch.from_numpy(img).to(model.device)
    img = img.permute(2, 0, 1).float()  # HWC -> CHW 순서로 변경
    img = img.unsqueeze(0)  # 배치 차원을 추가
    
    img /= 255.0  # 0 - 255에서 0.0 - 1.0으로 변환
    
    # 추론
    pred = model(img)
    pred = non_max_suppression(pred)

    detected_classes = set()
    for det in pred:
        if len(det):
            det[:, :4] = scale_coords(img.shape[2:], det[:, :4], frame.shape).round()
            for *xyxy, conf, cls in det:
                class_name = model.names[int(cls)]
                detected_classes.add(class_name)
                
                # 바운딩 박스 그리기
                label = f'{class_name}'
                color = (0, 255, 0) if class_name in required_classes else (0, 0, 255)  # 클래스에 따른 색상
                plot_one_box(xyxy, frame, label=label, color=color, line_thickness=2)

    return detected_classes

# 바운딩 박스 그리기 함수
def plot_one_box(xyxy, img, color=(0, 255, 0), label=None, line_thickness=2):
    c1, c2 = (int(xyxy[0]), int(xyxy[1])), (int(xyxy[2]), int(xyxy[3]))
    cv2.rectangle(img, c1, c2, color, thickness=line_thickness, lineType=cv2.LINE_AA)
    if label:
        font_thickness = max(line_thickness - 1, 1)
        t_size = cv2.getTextSize(label, 0, fontScale=line_thickness / 3, thickness=font_thickness)[0]
        c2 = c1[0] + t_size[0], c1[1] - t_size[1] - 3
        cv2.rectangle(img, c1, c2, color, -1, cv2.LINE_AA)
        cv2.putText(img, label, (c1[0], c1[1] - 2), 0, line_thickness / 3, (255, 255, 255), thickness=font_thickness, lineType=cv2.LINE_AA)

# 웹캠 캡처 및 객체 탐지 스레드
def capture_and_detect(cap, model):
    global detected_classes
    
    window_name = 'YOLOv5 Detection'
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    screen_width = 1024
    screen_height = 600
    cv2.resizeWindow(window_name, screen_width, screen_height)
    cv2.setWindowProperty(window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        detected_classes = set(detect_objects(model, frame))
        
        frame_resized = cv2.resize(frame, (screen_width, screen_height))
        cv2.imshow(window_name, frame_resized)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cv2.destroyAllWindows()

# 서보모터 제어 스레드
def servo_thread():
    global detected_classes
    door_open = False
    door_open_time = None  # 문이 열린 시간을 기록하는 변수
    
    while True:
        if required_classes.issubset(detected_classes) and not door_open:
            print("Opening door...")
            move_servo(90)  # 문 열기
            door_open = True
            door_open_time = time.time()  # 문이 열린 시간을 기록
        elif (restricted_classes.intersection(detected_classes) or 
              (door_open and time.time() - door_open_time > 5 and not required_classes.issubset(detected_classes))) and door_open:
            print("Closing door...")
            move_servo(0)  # 문 닫기
            door_open = False
        time.sleep(1)

# 메인 함수
def main():
    weights_path = './runs/train/exp6/weights/best.pt'
    model = load_model(weights_path)
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    global detected_classes
    detected_classes = set()

    capture_thread = threading.Thread(target=capture_and_detect, args=(cap, model))
    capture_thread.start()

    servo_thread_instance = threading.Thread(target=servo_thread)
    servo_thread_instance.start()

    capture_thread.join()
    servo_thread_instance.join()

    cap.release()
    cv2.destroyAllWindows()
    servo.stop()
    GPIO.cleanup()

if __name__ == "__main__":
    main()

