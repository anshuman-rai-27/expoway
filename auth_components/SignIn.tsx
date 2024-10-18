import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Button, TextInput, View } from "react-native";
import { RootStackParamList } from "../App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateKeyPair } from "@/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { encodeBase64, encodeUTF8 } from "tweetnacl-util";
 
type loginScreenProp = NativeStackNavigationProp<RootStackParamList,"Login">

export function SignIn() {
  const navigation = useNavigation<loginScreenProp>();
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signUp" | "signIn">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const getPublicKey = useMutation(api.users.setPublicKey);
  async function login(){
    const userKeys = generateKeyPair();
    AsyncStorage.setItem('email', email);
    try{
    const data = await signIn("password", {email, password , flow:step});
    }catch(error){
      console.error(error)
    }
    if(step==="signUp"){
      AsyncStorage.setItem('privKey', encodeBase64(userKeys.secretKey));
      getPublicKey({email:email, publicKey:encodeBase64(userKeys.publicKey)})  
    }
    navigation.navigate('Chat', {email:email})
  }
  return (
    <View>
      <TextInput
        style={{
          color:"black"
        }}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        inputMode="email"
        autoCapitalize="none"
      />
      <TextInput
        style={{
          color:"black"
      }}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <Button
        title={step === "signIn" ? "Sign in" : "Sign up"}
        onPress={() => {
          login();
          // void signIn("password", { email, password, flow: step });
        }}
      />
      <Button
        title={step === "signIn" ? "Sign up instead" : "Sign in instead"}
        onPress={() => setStep(step === "signIn" ? "signUp" : "signIn")}
      />
    </View>
  );
}