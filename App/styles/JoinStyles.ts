import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#034198',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
    width: '30%',
  },
  atSymbol: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    width: 40,
  },
  inputBox: {
    height: 40,
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#504F4F',
    textAlign: 'left',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  emailInputBox: {
    height: 40,
    width: '29%',
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#504F4F',
    textAlign: 'left',
  },
  pickerButton: {
    height: 40,
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#504F4F',
  },
  customDomainInput: {
    height: 40,
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 4,
    fontSize: 14,
    color: '#504F4F',
    textAlign: 'left',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  dateInputBox: {
    height: 40,
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 4,
    fontSize: 14,
    color: '#504F4F',
    textAlign: 'left',
  },
  dateIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  permissionsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  permissionOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  permissionOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  checkbox: {
    marginLeft: 5,
  },
  signupButton: {
    width: '40%',
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalList: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 200,
  },
  modalItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 8,
    fontWeight: 'bold',
  },
  errorMessageContainer: {
    marginVertical: 10,
    alignItems: 'flex-start',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
});

export default styles;
