import { NavigationProp, RouteProp, useNavigation } from "@react-navigation/native";
import { Button, Text, View } from "react-native";
import { RootStackParamList } from "../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Authenticated, useQuery,  } from "convex/react";
import { TestComponent } from "./TestComponent";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";


type chatScreenProp = NativeStackNavigationProp<RootStackParamList, "Chat">

export function ChatComponent({route}:{route:RouteProp<any>}) {
    const navigation = useNavigation<chatScreenProp>();
    const group = useQuery(api.groups.getGroupWithEmail,{
        email:route.params!.email
    })

    function Life(groupId:Id<'groups'>){
        navigation.navigate('GroupChat', {groupId:groupId, email:route.params!.email})
    }
    return (
        <Authenticated>
            <TestComponent />
            <View>
                <Text>Life </Text>
                <Button title="Go back" onPress={() => { navigation.goBack(); }} />
            </View>
            {group?.data?.map((value)=>(
                <Button key={value!._id} title={value!.name} onPress={()=>{
                    Life(value!._id);
                }}/>
            ))}
        </Authenticated>
    )
} 