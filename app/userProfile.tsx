import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse, ImageLibraryOptions } from 'react-native-image-picker';
import { api } from '../convex/_generated/api';
import { useAction, useMutation, useQuery } from 'convex/react';
import { RouteProp } from '@react-navigation/native';

interface User {
  name: string;
  dp?: string; 
}

function UserProfileComponent({route}:{route:RouteProp<any>}){
  const [username, setUsername] = useState<string>("");
  const [image, setImage] = useState<any>();
  const [userImage, setUserImage] = useState<string>('https://via.placeholder.com/100');

  const getImage = useAction(api.message.getUrluploadFile)
  const uploadImage = useAction(api.message.getUploadUrl)
  const updateUser = useMutation(api.users.updateUser)
  const user = useQuery(api.users.getUser,{
    email:route.params!.email
  })

  useEffect(()=>{

  },[])

  const handleUpdateProfile = async () => {
    if(!image){
      await updateUser({
        email:route.params!.email,
        name:username
      })
      Alert.alert('Successfully updated your details');
    }else{
      try{
        
        const file = await fetch(image.uri)
        
        const blob = await file.blob()
        const url = await uploadImage()
        
        const response = await fetch(url, {
          method:'POST',
          headers:{
            'Content-Type':image.type
          },
          body:blob
        })
        const {storageId} = await response.json()
        const storageUrl = await getImage({storageId})
        await updateUser({
          email:route.params!.email,
          imgUrl:storageUrl!,
          name:username ?? user?.name
        })
        Alert.alert('Successfully updated your details')
      }catch(error){
        console.error(error);
        Alert.alert('There is an issue in the updating your details')
      }
    }
  };

  const handleLogout = () => {
    
    Alert.alert('Logged out successfully');
  };

  const handleImagePick = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 1,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if(response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
        const uri = response.assets[0].uri;
        if (uri) {
          setUserImage(uri)
        }
      }
    });
  };

  const handleBackPress = () => {
    // Implement your logic to navigate back or close the profile
    Alert.alert('Back button pressed');
  };

  return (
    <ImageBackground
      source={{uri: 'https://anshuman.sirv.com/ethos/chat1.jpg'}}
      style={styles.container}
      resizeMode="cover"
    >
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Image
          source={{uri: 'https://anshuman.sirv.com/ethos/back.png'}}
          style={styles.backIcon}
        />
      </TouchableOpacity>

      <Text style={styles.title}>User Profile</Text>
      <TouchableOpacity onPress={handleImagePick}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: userImage || 'https://via.placeholder.com/100',
            }}
            style={styles.dp}
          />
          <View style={styles.iconContainer}>
            <Image
              source={{uri: 'https://anshuman.sirv.com/ethos/editIcon.png'}}
              style={styles.icon}
            />
          </View>
        </View>
      </TouchableOpacity>
      <View style={{
        width:"100%"
      }}>
      <Text style={styles.name}>Name</Text>
      <TextInput
        style={styles.input}
        defaultValue={user?.name ?? username}
        placeholderTextColor={'white'}
        onChangeText={setUsername}
        placeholder="Enter your name"
      />
      </View>

      {/* Styled Save button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      {/* Styled Logout button */}
      <TouchableOpacity style={[styles.saveButton, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout !</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  name: {
    // marginRight: 200,
    marginLeft:5,
    fontWeight: 'bold',
    marginTop: 20,
    color:'#DD651B',
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    color: 'white',
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  dp: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderColor: '#000',
    borderWidth: 3,
  },
  iconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#bbb',
    borderWidth: 0,
  },
  icon: {
    width: 20,
    height: 20,
    marginTop: 4,
  },
  input: {
    marginTop: 20,
    width: '100%',
    color: 'white',
    paddingHorizontal:10,
    paddingVertical:10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#DD651B',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  logoutButton: {
    marginTop: 60,
    backgroundColor:'grey',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserProfileComponent;
