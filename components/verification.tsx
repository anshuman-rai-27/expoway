import { useState } from "react"
import { AuthComponent } from "./login"
import { NavigationProp, RouteProp, useNavigation } from "@react-navigation/native";
import { Dimensions, TextInput, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import { useAuthActions } from "@convex-dev/auth/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { encodeBase64 } from "tweetnacl-util";
import { encryptSecretKey, generateKey, generateKeyPair } from "../utils";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

const height = Dimensions.get('screen').height
const width = Dimensions.get('screen').width

type VerificationNavigationProp = NativeStackNavigationProp<RootStackParamList, "Verification">

export const VerificationScreen = ({ route }: { route: RouteProp<any> }) => {
    const [code, setCode] = useState<string>("");
    const navigation = useNavigation<VerificationNavigationProp>()
    const { signIn } = useAuthActions();
    const [err,setErr] = useState<string>("");
    
    const setPublicKey = useMutation(api.users.setPublicKey);
    const checkVerificationCode = useMutation(api.users.checkVerificationCode)
    const createSession = useMutation(api.session.createSession);
    
    async function handleSubmit() {
        const email = route.params?.email
        const password = route.params?.password
        const type = route.params?.type
        if(!(await checkVerificationCode({email:email, code:code, type:type}))){
            setErr('Error: Invalid Code');
            return;
        }
        if (type === "signIn") {
            try {
                await signIn("password", { email: email, password: password, flow: "signIn" })
                await AsyncStorage.setItem('email', email);
                navigation.navigate('SessionVerification', { email: email })
            } catch (error) {
                console.error(error);
            }
        } else {
            const userKeys = generateKeyPair();
            const secretKey = generateKey();
            try {
                await signIn("password", { email, password, flow: "signUp" })
                const privkey = encodeBase64(userKeys.secretKey);
                await AsyncStorage.setItem('email', email);
                const sessionId = await createSession({
                    email:email,
                    secret:encryptSecretKey(privkey, secretKey)
                })
                await AsyncStorage.setItem(email, JSON.stringify({sessionId:sessionId,privkey:secretKey}));
                await setPublicKey({ email: email, publicKey: encodeBase64(userKeys.publicKey) });
                navigation.navigate('Username', { email: email })
            } catch (error) {
                console.error(error);
            }
        }
    }
    return (
        <AuthComponent>
            <View style={{
                display: 'flex',
                height: height,
                justifyContent: 'center'
            }}>
                <Text style={{
                    paddingVertical: 10,
                    fontWeight: 900,
                    fontSize: 20,
                    color:'white'
                }}>Verification Code</Text>
                <TextInput style={{
                    backgroundColor: 'rgba(51, 51, 51, 0.7)', // Transparent background
                    color: '#fff', // Text color unaffected by opacity
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 20,
                    fontWeight: '900',
                }} placeholderTextColor={'white'} placeholder="Verification Code" value={code} onChangeText={setCode} keyboardType="number-pad" />
                <TouchableOpacity style={{
                    backgroundColor: '#DD651B',
                    opacity: 0.8,
                    padding: 15,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginBottom: 20,
                }} onPress={handleSubmit}>
                    <Text style={{
                        color: '#fff',
                        fontSize: 16,
                    }}>Verify</Text>
                </TouchableOpacity>
            </View>
        </AuthComponent>
    )
}