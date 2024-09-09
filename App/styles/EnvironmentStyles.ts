import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
    alignItems: 'center', // 중앙 정렬
  },
  iconContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 20,
    right: 15,
  },
  icon: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  topLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#034198',
    position: 'absolute',
    top: 60,
  },
  imgContainer: {
    top: 100,
    alignItems: 'center', // 중앙 정렬
    justifyContent: 'center', // 중앙 정렬
  },
  dateTime: {
    alignItems: 'center',
    marginBottom: 40,
  },
  time: {
    color: '#034198',
    fontSize: 22,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    color: '#034198',
    fontSize: 16,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  image: {
    width: 120,
    height: 120,
  },
  warningText: {
    width: 159,
    height: 39,
    textAlign: 'center',
    fontSize: 26,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    marginTop: 30, // 상단 마진 추가
  },
  middleLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#034198',
    position: 'absolute',
    top: 450,
  },
  infoContainer: {
    position: 'absolute',
    top: 480,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 10,
  },
  infoText: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '700',
    marginBottom: 30, // marginBottom 조정
    textAlign: 'center',
  },
  infoValue: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#034198',
    position: 'absolute',
    top: 600,
  },
});

export default styles;
