import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { box } from "tweetnacl";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";

export default function Testing(){
    const [secr,setSecr] = useState<string>();
    const [poub, setPoub] = useState<string>();
    async function setPriv(){
        const value = await AsyncStorage.getItem('privKey');
        setSecr(value!);
        const data = box.keyPair.fromSecretKey(decodeBase64(value!));
        setPoub(encodeBase64(data.publicKey))
    }
    useEffect(()=>{
        setPriv()
    },[])
    return (
        <View>
            <Text style={{color:"black"}}>PrivKey:{secr}</Text>
            <Text style={{color:"black"}}>PubliKey:{poub}</Text>
        </View>
    )
}