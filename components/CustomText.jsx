import { Text } from 'react-native'
import { Colors, Fonts, Spacing } from '../Theme'

const CustomText = ({ style, title = false, ...props }) => {

  let color = Colors.text
  let fontSize = Fonts.medium
  if(title){
    fontSize = Fonts.large
    color = Colors.primary
  }

  return (
    <Text
      style={[{color, fontSize, fontWeight:"bold"}, style]}
      {...props}
    />
  )
}

export default CustomText