import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button, TextInput, View } from "react-native";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function Regiser({navigation}:{navigation:NavigationProp<RootStackParamList>}){
  const {signIn} = useAuthActions();
  const [email,setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const setPublicKey = useMutation(api.users.setPublicKey);
  async function register(){
    await signIn("password", {email, password,flow:"signUp"});
    
    navigation.navigate('Group');
  }

  return (
    <View>
      <TextInput style={{color:"black"}} placeholder="Email" onChangeText={setEmail} value={email} inputMode="email" autoCapitalize="none"/>
      <TextInput style={{color:"black"}} placeholder="Password" onChangeText={setPassword} value={password} secureTextEntry/>
      <Button onPress={()=>{
        register();
      }} title="SignIn" />
    </View>
  )
}