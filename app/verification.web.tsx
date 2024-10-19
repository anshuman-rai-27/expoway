import { useState } from "react"
import { AuthComponent } from "@/app/index"
import { NavigationProp, RouteProp, useNavigation } from "@react-navigation/native";
import { Dimensions, TextInput, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import { useAuthActions } from "@convex-dev/auth/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { encodeBase64 } from "tweetnacl-util";
import { encryptSecretKey, generateKey, generateKeyPair } from "@/utils";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
// import { useRouter } from "expo-router";
import { useRouter, useLocalSearchParams } from "expo-router";

const height = Dimensions.get('screen').height
const width = Dimensions.get('screen').width

type VerificationNavigationProp = NativeStackNavigationProp<RootStackParamList, "Verification">

// type VerificationRouteParams = {
//     email: string;
//     password: string;
//     type: "signIn" | "signUp"; // Define the type explicitly
// };

const Verification = (
    // { route }: { route: { params: VerificationRouteParams } }
) => {
    const [code, setCode] = useState<string>("");
    const navigation = useNavigation<VerificationNavigationProp>()
    const { signIn } = useAuthActions();
    const [err,setErr] = useState<string>("");
    const router = useRouter();
    const setPublicKey = useMutation(api.users.setPublicKey);
    const checkVerificationCode = useMutation(api.users.checkVerificationCode)
    const createSession = useMutation(api.session.createSession);
    const params = useLocalSearchParams();
    // console.log(params);
    const email = params?.email as string;
    const password = params?.password as string;
    const type = params?.type as "signIn" | "signUp";

    async function handleSubmit() {
        // const email = route.params?.email
        // const password = route.params?.password
        // const type = route.params?.type

        // const { email, password, type } = route.params;

        if(!(await checkVerificationCode({email:email, code:code, type:type}))){
            setErr('Error: Invalid Code');
            return;
        }
        if (type === "signIn") {
            try {
                await signIn("password", { email: email, password: password, flow: "signIn" })
                await AsyncStorage.setItem('email', email);
                // navigation.navigate('SessionVerification', { email: email })
                router.push({
                    pathname: '/sessionVerification',
                    params: { email }, // Use params object
                  });
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
                // navigation.navigate('Username', { email: email })
                router.push({
                    pathname: '/username',
                    params: { email }, // Use params object
                  });
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
    justifyContent: 'center',
    alignItems: 'center', // Center horizontally
    padding: 20, // Add some padding inside the container
}}>
    <View style={{
        backgroundColor: 'rgba(51, 51, 51, 0.9)', // Slightly darker background for contrast
        padding: 30, // Inner padding for the form
        borderRadius: 15, // Rounded corners
        borderWidth: 2, // Border width
        borderColor: '#DD651B', // Border color
        width: '80%', // Make the container responsive
        maxWidth: 400, // Limit max width for larger screens
        alignItems: 'center', // Align text and inputs in the center
    }}>
        <Text style={{
            paddingVertical: 10,
            fontWeight: '900',
            fontSize: 20,
            color: 'white',
            textAlign: 'center', // Center the text
        }}>
            Verification Code
        </Text>
        <TextInput style={{
            backgroundColor: 'rgba(51, 51, 51, 0.7)', // Transparent background
            color: '#fff', // Text color unaffected by opacity
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
            fontWeight: '900',
            width: '100%', // Make input full-width
        }} 
        placeholderTextColor={'white'} 
        placeholder="Verification Code" 
        value={code} 
        onChangeText={setCode} 
        keyboardType="number-pad" />
        <TouchableOpacity style={{
            backgroundColor: '#DD651B',
            opacity: 0.8,
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            marginBottom: 20,
            width: '100%', // Button takes full width
            
        }} onPress={handleSubmit}>
            <Text style={{
                color: '#fff',
                fontSize: 16,
            }}>Verify</Text>
        </TouchableOpacity>
    </View>
</View>

        </AuthComponent>
    )
}

export default Verification;