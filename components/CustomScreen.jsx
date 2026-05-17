import { StyleSheet, Text, View } from 'react-native'
import { Colors, Fonts, Spacing } from '../Theme'

const CustomScreen = ({children, style, ...props}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  )
}

export default CustomScreen

const styles = StyleSheet.create({
  container:{
    backgroundColor: Colors.screenBackground,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})