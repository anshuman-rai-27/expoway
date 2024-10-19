import { useState, useEffect, useRef } from "react";
import { AuthComponent } from "@/app/index";
import { View, Text } from "react-native";
import { Dimensions, TouchableOpacity } from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Id } from "../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { generateKey } from "../utils";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { encodeBase64 } from "tweetnacl-util";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useRouter, useLocalSearchParams } from "expo-router";

const height = Dimensions.get("screen").height;

type sessionVerificationNavigationProp = NativeStackNavigationProp<RootStackParamList, "SessionVerification">

const SessionVerification = (
    // { route }: { route: RouteProp<any> }
) => {
    const [intervalValue, setIntervalValue] = useState<number>(0);
    const [sessionId, setSessionId] = useState<Id<'sessions'>>();
    const createTempSession = useMutation(api.session.createTempSession);
    const updateTempSession = useMutation(api.session.updateTempSession)
    const router = useRouter();
    const params = useLocalSearchParams();
    const email = params?.email as string;
    const session = useQuery(api.session.getSessionById, {
        sessionId: sessionId
    })
    const user = useQuery(api.users.getUser, {
        email: email
    })
    const storage = useAsyncStorage(email);
    const intervalRef = useRef<any>();
    
    
    const navigation = useNavigation<sessionVerificationNavigationProp>()

    useEffect(() => {
        createTempSessionFunction().then(()=>{
            intervalRef.current = setInterval(() => {
                const code = Math.floor(Math.random() * 90000 + 10000);
                setIntervalValue((prevValue) => code);
                const secretKey = generateKey();
                if (sessionId) {
                    updateTempSession({
                        sessionId: sessionId!,
                        code: code.toString(),
                        secret: secretKey,
                    })
                    storage.setItem(JSON.stringify({
                        sessionId: sessionId,
                        privkey: secretKey
                    }))
                }
            }, 60000);
        })
        
        return () => clearInterval(intervalRef.current);
    }, [user]);
    useEffect(() => {
        if (session?.type === "PERMANENT") {
            clearInterval(intervalRef.current);

            // navigation.navigate('Chat', { email: email });
            router.push({pathname: "/chatScreen", params: { email: email as string }});
        }
    }, [session])
    async function createTempSessionFunction() {
        const secretKey = generateKey();
        if (user){
            const code = Math.floor(Math.random() * 90000 + 10000)
            const sessionId = await createTempSession({
                code: code.toString(),
                secret: secretKey,
                userId: user._id
            })
            setSessionId(sessionId)
            
            storage.setItem(JSON.stringify({
                sessionId: sessionId,
                privkey: secretKey
            }))
            setIntervalValue(code)
        }
    }
    return (
        <AuthComponent>
            <View
                style={{
                    display: "flex",
                    height: height,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text
                    style={{
                        paddingVertical: 10,
                        fontWeight: "900",
                        color: "white",
                        fontSize: 20,
                    }}
                >
                    Interval Value: {intervalValue}
                </Text>
                <TouchableOpacity
                    style={{
                        backgroundColor: "#DD651B",
                        opacity: 0.8,
                        padding: 15,
                        borderRadius: 10,
                        alignItems: "center",
                        marginBottom: 20,
                    }}
                    onPress={() => setIntervalValue(0)}
                >
                    <Text
                        style={{
                            color: "#fff",
                            fontSize: 16,
                        }}
                    >
                        Reset
                    </Text>
                </TouchableOpacity>
            </View>
        </AuthComponent>
    );
};


export default SessionVerification;