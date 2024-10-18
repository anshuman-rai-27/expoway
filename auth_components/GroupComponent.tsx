import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Id } from "../convex/_generated/dataModel";
import { api } from "../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Button, ScrollView, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { box } from "tweetnacl";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";

import { decrypt, encrypt } from "../utils";

type groupChatScreenProp = NativeStackNavigationProp<RootStackParamList, "GroupChat">;


export default function GroupComponent({navigation, route}: {navigation: NavigationProp<groupChatScreenProp>, route: RouteProp<any>}) {
    const user = useQuery(api.users.getUser, { email: route.params!.email });
    const publicKeyRetrieve = useMutation(api.users.getPublicKey);
    const group = useQuery(api.groups.getGroup, { groupId: route.params!.groupId });
    const messages = useQuery(api.message.getMessageByGroupId, { groupId: route.params!.groupId });
    const create = useMutation(api.message.createMessage);
    
    const [priv, setPriv] = useState<Uint8Array>();
    const [message, setMessage] = useState<string>("");
    const [receiveUser, setReceiveUser] = useState<any>();
    const [sharedKey, setSharedKey] = useState<Uint8Array>();

    useEffect(() => {
        const initializePrivateKeyAndSharedKey = async () => {
            try {
                const privd = await AsyncStorage.getItem('privKey');
                const privKey = decodeBase64(privd!);
                setPriv(privKey);
                if (group?.data?.members) {
                    const recipient = group.data.members.find((member: any) => member.email !== route.params!.email);
                    if (recipient) {
                        setReceiveUser(recipient);
                        const pkey = await publicKeyRetrieve({email:recipient!.email});       
                        const shared = box.before(decodeBase64(pkey), privKey);
                        setSharedKey(shared);
                    }
                }
            } catch (error) {
                console.error("Error setting keys:", error);
            }
        };
        initializePrivateKeyAndSharedKey();
    }, [group, user]);

    async function createMessage() {
        if (sharedKey) {
            await create({
                groupId: route.params!.groupId,
                from: user!._id,
                content: encrypt(sharedKey, message),
            });
        }
    }

    function decryptMessage(message: string, from: Id<'users'>) {
        try {
            if (from !== user!._id && sharedKey) {
                return decrypt(sharedKey, message);
            } else if (sharedKey) {
                return decrypt(sharedKey, message);
            }
        } catch (error) {
            console.error("Decryption error:", error);
        }
    }

    return (
        <View>
            <ScrollView style={{ height: "100%" }}>
                {messages?.map((value) => (
                    <View key={value._id} style={{ width: "100%" }}>
                        <Text style={{ color: "black" }}>
                            {value.from === user!._id ? "Me" : "Them"}: {decryptMessage(value.content, value.from)}
                        </Text>
                    </View>
                ))}
            </ScrollView>
            <View style={{ width: "100%", position: "absolute", bottom: 0 }}>
                <TextInput placeholder="Message" onChangeText={setMessage} style={{ color: "black" }} />
                <Button onPress={createMessage} title="Submit" />
            </View>
        </View>
    );
}
