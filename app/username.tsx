import { useState } from "react"
import { AuthComponent } from "@/app/index"
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { Dimensions, Image, TextInput, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import { useAction, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { launchImageLibrary } from "react-native-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router"; // Expo Router imports


const { height, width } = Dimensions.get('screen')


const Username = (
    // { navigation, route }: { navigation: NavigationProp<any>, route: RouteProp<any> }
) => {
    const [username, setUsername] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [userImage, setUserImage] = useState<string>('https://via.placeholder.com/100');
    const [image, setImage] = useState<any>();
    const getImage = useAction(api.message.getUrluploadFile)
    const uploadImage = useAction(api.message.getUploadUrl)
    const updateUser = useMutation(api.users.updateUser)
    const [err, setErr] = useState<string>("");
    const router = useRouter(); // Use router from Expo
    const { email } = useLocalSearchParams(); // Extract params from the route

    const handleSelectImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                includeBase64: false,
                quality: 1,
                
            },
            (response) => {
                // Check if user canceled the picker
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                    return;
                }

                // Check for any errors in response
                if (response.errorCode) {
                    console.log('ImagePicker Error: ', response.errorMessage); // Log error message
                    return;
                }
                
                // Check if assets are available and set the image
                if (response.assets && response.assets.length > 0) {
                    
                    setImage(response.assets[0]);
                    const source = response.assets[0].uri; // Get the image URI

                    if (source) {
                        setUserImage(source); // Set the selected image
                    }
                }
            }
        );
    };
    async function handleSubmit() {
        if(!image){
            await updateUser({
                email : email as string,
                imgUrl:userImage,
                name:username,
                phone:phone
            })    
            // navigation.navigate('Chat', {email:route.params!.email})
            router.push({
                pathname: "/chatScreen",
                params: { email: email as string }, // Ensure email is passed as string
            });
            return;
        }
        try{
        const file = await fetch(image.uri)
        const blob =await file.blob()
        const url = await uploadImage()
        const response = await fetch(url,{
            method:'POST',
            headers:{
                'Content-Type':image.type,
            },
            body:blob
        })
        console.log(response,'response');
        console.log(response.url,"responseurl");
        // const {storageId} = await response.json()
        // const storageUrl = await getImage({storageId})
        // console.log(storageUrl,"storageurl");
        await updateUser({
            email:email as string,
            imgUrl:response.url,
            name:username,
            phone:phone
        })
        // navigation.navigate('Chat', {email:route.params!.email})
        router.push({
            pathname: "/chatScreen",
            params: { email: email as string }, // Ensure email is passed as string
        });
        }catch(error){
            console.error(error)
        }
    }
    return (
        
            <View style={{
                display: 'flex',
                height: height,
                justifyContent: 'center'
            }}>
                <AuthComponent>
                <Text style={{
                    paddingVertical: 10,
                    fontWeight: 900,
                    fontSize: 20,
                }}>Verification Code</Text>
                <TouchableOpacity onPress={handleSelectImage}>
                    <Image source={{ uri: userImage }} style={{
                        width: 70,
                        height: 70,
                        borderRadius: 50,
                        alignSelf: 'center',
                        marginBottom: 10,
                    }} />
                    <Text style={{
                        color: '#DD651B',
                        textAlign: 'center',
                        marginBottom: 20,
                        fontWeight: '600',
                    }}>Select User Icon </Text>
                </TouchableOpacity>
                <TextInput style={{
                    backgroundColor: 'rgba(51, 51, 51, 0.7)', // Transparent background
                    color: '#fff', // Text color unaffected by opacity
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 20,
                    fontWeight: '900',
                }} placeholderTextColor="#fff" placeholder="Username" value={username} onChangeText={setUsername} />
                <TextInput style={{
                    backgroundColor: 'rgba(51, 51, 51, 0.7)', // Transparent background
                    color: '#fff', // Text color unaffected by opacity
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 20,
                    fontWeight: '900',
                }} placeholderTextColor="#fff" placeholder="Phone" value={phone} onChangeText={setPhone} />

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
                </AuthComponent>
            </View>
        
    )
}

export default Username;