import {Dimensions, StyleSheet} from 'react-native';
import {colors} from '../constants/colors';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    flex: 1,
  },

  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    minHeight: 48,
    borderColor: colors.grey3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    padding: 0,
    margin: 0,
    color: '#0F1414',
    fontSize: 14,
    flex: 1,
  },

  modalContainer: {
    padding: 20,
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: Dimensions.get('window').width * 0.8,
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  image: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'red',
    borderRadius: 100,
  },
});
