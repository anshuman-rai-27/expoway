import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { api } from '../convex/_generated/api';
import { useAction, useMutation, useQuery } from 'convex/react';

const { width } = Dimensions.get('window');

// Sample user data (the creator of the group)
const sampleUserData = {
  id: "0",
  name: "Me",
  email: "john.doe@example.com",
  avatar: "https://via.placeholder.com/50",
};

// Sample contacts data
const sampleContacts = [
  {
    id: "1",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: "2",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    avatar: "https://via.placeholder.com/50",
  },
  {
    id: "3",
    name: "Bob Brown",
    email: "bob.brown@example.com",
    avatar: "https://via.placeholder.com/50",
  },
];

export default function GroupComponent({ navigation, route }: { navigation: NavigationProp<any>, route: RouteProp<any> }) {
  const [groupName, setGroupName] = useState('');
  const [contacts, setContacts] = useState<any>(sampleContacts); // Sample contacts data
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]); // State for selected contacts
  const [image, setImage] = useState<any>();
  const [groupImage, setGroupImage] = useState<string>('https://via.placeholder.com/100'); // Default group image
  const [sampleUser, setSampleUser] = useState<any>([])
  const user = useQuery(api.users.getUser, {
    email: route.params!.email
  })
  const users = useQuery(api.users.getAllUser);

  const getImage = useAction(api.message.getUrluploadFile)
  const uploadImage = useAction(api.message.getUploadUrl)
  const createGroup = useMutation(api.groups.createGroup);
  const joinGroup = useMutation(api.groups.joinGroup);


  // >>>>>>>>>> Setting Group Data
  useEffect(() => {
    setContacts(users)
  }, [users])
  useEffect(() => {
    console.log(user)
    setSampleUser(user)
  }, [user])

  // ...............................................Group>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  console.log(sampleUser)
  useEffect(() => {
    setSelectedContacts([sampleUser]);
  }, [sampleUser]);

  // Handle contact selection
  const handleSelectContact = (contact: any) => {
    setSelectedContacts([...selectedContacts, contact]);
    setContacts(contacts.filter((c: any) => c._id !== contact._id)); // Remove the selected contact from the contacts list
  };

  // Handle removing selected contact
  const handleRemoveContact = (contact: any) => {
    if (contact._id === sampleUser?._id) {
      return; // Don't allow removing the user (creator) from the selected contacts
    }
    setSelectedContacts(selectedContacts.filter((c: any) => c._id !== contact._id)); // Remove contact from selected
    setContacts([...contacts, contact]); // Add contact back to the contacts list
  };

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
        console.log(response);
        // Check if assets are available and set the image
        if (response.assets && response.assets.length > 0) {
          setImage(response.assets[0])
          const source = response.assets[0].uri; // Get the image URI
          if (source) {
            setGroupImage(source); // Set the selected image
          }
        }
      }
    );
  };

  // ...........................................................Group Cretion ........................
  // Handle group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Group Creation', 'Please enter a group name.');
      return;
    }
    if (selectedContacts.length < 2) {
      Alert.alert('Group Creation', 'You need to select at least 1 person to create a group.');
      return;
    }
    try {
      let groupImage = "https://via.placeholder.com/50";
      if (image) {
        const file = await fetch(image.uri)
        const blob = await file.blob()
        const url = await uploadImage()
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': image.type,
          },
          body: blob
        })
        const { storageId } = await response.json()
        groupImage = await getImage({ storageId }) ?? groupImage
      }
      const group = await createGroup({
        email: route.params!.email,
        name: groupName,
        description: "",
        imgUrl: groupImage,
        isDm: false
      })
      for (let i = 0; i < selectedContacts.length; i++) {
        await joinGroup({
          groupId: group.data!.groupId,
          email: selectedContacts[i].email
        })
      }
      navigation.navigate('GroupChat', { email: route.params!.email, groupId: group.data?.groupId })
    } catch (error) {
      console.error(error);
    }
    // console.log('Group created with:', groupName, groupImage, selectedContacts);
    // Add group creation logic here
    setGroupName(''); // Reset group name
    setGroupImage('https://via.placeholder.com/100');
    setSelectedContacts([sampleUser]);
    setContacts(sampleContacts);
  };

  // Render contacts list
  const renderContact = ({ item }: { item: any }) => {
    if (sampleUser?._id === item._id) {
      return <TouchableOpacity></TouchableOpacity>;
    }
    return (
      <TouchableOpacity style={styles.contactItem} onPress={() => handleSelectContact(item)}>
        <Image source={{ uri: item.image ?? 'https://via.placeholder.com/50' }} style={styles.avatar} />
        <Text style={styles.contactName}>{item.name ?? item.email}</Text>
      </TouchableOpacity>
    )
  };

  // Render selected contacts list (name below image)
  const renderSelectedContact = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.selectedContactItem} onPress={() => handleRemoveContact(item)}>
      <Image source={{ uri: item.image ?? 'https://via.placeholder.com/50' }} style={styles.avatarSmall} />
      <Text style={styles.selectedContactName}>{item.name ?? item.email}</Text>
      {item._id !== sampleUser._id && (
        <Icon name="times" size={16} color="#fff" style={styles.removeIcon} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Create Group</Text>

      {/* Group Image Selection */}
      <TouchableOpacity onPress={handleSelectImage}>
        <Image source={{ uri: groupImage }} style={styles.groupIcon} />
        <Text style={styles.changeIconText}>+ Add Group Icon </Text>
      </TouchableOpacity>

      {/* Group Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        placeholderTextColor="#999"
        value={groupName}
        onChangeText={setGroupName}
      />

      {/* Selected Contacts */}
      {selectedContacts.length > 1 && (
        <>
          <Text style={styles.subtitle}>Create group with...</Text>
          <FlatList
            data={selectedContacts}
            renderItem={renderSelectedContact}
            keyExtractor={(item) => item._id}
            horizontal
            style={styles.selectedContactList}
          />
        </>
      )}

      {/* Select Contacts */}
      <Text style={styles.subtitle}>Select Contacts</Text>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item._id}
        style={styles.contactList}
      />

      {/* Create Group Button */}
      <TouchableOpacity style={styles.createGroupButton} onPress={handleCreateGroup}>
        <Icon name="arrow-right" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 18,
    color: '#bbb',
    marginBottom: 10,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(51, 51, 51, 0.7)',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontWeight: '900',
  },
  groupIcon: {
    width: 70,
    height: 70,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  changeIconText: {
    color: '#DD651B',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  contactList: {
    flexGrow: 0,
    marginBottom: 20,
  },
  contactItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  contactName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  selectedContactItem: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    alignItems: 'center',
    width: 80,
  },
  selectedContactList: {
    marginBottom: 20,
    flexGrow: 0,
  },
  selectedContactName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  removeIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  createGroupButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DD651B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
