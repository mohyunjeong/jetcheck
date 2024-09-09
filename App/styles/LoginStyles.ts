// styles/LoginStyles.ts

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#034198',
    flex: 1,
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
    width: 250,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  idText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 25,
  },
  passwordText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  inputBox: {
    flex: 1,
    height: 35,
    backgroundColor: 'white',
    borderRadius: 4,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  autoLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    marginLeft: 10,
  },
  autoLoginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    marginBottom: 20,
  },
  loginButton: {
    width: 100,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  signupButton: {
    width: 100,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  autoLoginTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;
