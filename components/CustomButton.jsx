import { Pressable, StyleSheet } from 'react-native'
import { Colors} from '../Theme'

function CustomButton({ style, ...props }) {

  return (
    <Pressable
      style={({ pressed }) => [ 
        styles.btn, 
        pressed && styles.pressed, 
        style 
      ]}
      {...props}
    />
  )
}
const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    padding: 18,
  },
  pressed: {
    opacity: 0.5
  },
})

export default CustomButton