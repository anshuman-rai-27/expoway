import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, StatusBar, Alert } from 'react-native';
import {  RouteProp, useNavigation } from '@react-navigation/native';
import { api } from '../convex/_generated/api';
import {  useQuery } from 'convex/react';
import { RootStackParamList } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

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

type dmGroupNavigation = NativeStackNavigationProp<RootStackParamList, "DmCreate">

export default function GroupComponent({route }: {  route: RouteProp<any> }) {
  const [groupName, setGroupName] = useState('');
  const navigation = useNavigation<dmGroupNavigation>();
  const [contacts, setContacts] = useState<any>(sampleContacts); 
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]); 
  const [image, setImage] = useState<any>();
  const [sampleUser, setSampleUser] = useState<any>([])
  const user = useQuery(api.users.getUser, {
    email: route.params!.email
  })
  const users = useQuery(api.users.getAllUser);

  // const getImage = useAction(api.message.getUrluploadFile)
  // const uploadImage = useAction(api.message.getUploadUrl)
  // const createGroup = useMutation(api.groups.createGroup);
  // const joinGroup = useMutation(api.groups.joinGroup);



  // >>>>>>>>>> Setting Group Data
  useEffect(() => {
    setContacts(users)
  }, [users])
  useEffect(() => {
    console.log(user)
    setSampleUser(user)
  }, [user])

  // ...............................................Group>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // console.log(sampleUser)
  useEffect(() => {
    setSelectedContacts([sampleUser]);
  }, [sampleUser]);

  // Handle contact selection
  const handleSelectContact = (contact: any) => {
    navigation.navigate('DmChat', {fromId:user!._id, toId:contact._id}) // Remove the selected contact from the contacts list
  };

  // Handle removing selected contact
  

  // ...........................................................Group Cretion ........................
  // Handle group creation
  

  // Render contacts list
  const renderContact = ({ item }: { item: any }) => {
    if(sampleUser._id===item._id){
      return <TouchableOpacity></TouchableOpacity>; 
    }
    return (
      <TouchableOpacity style={styles.contactItem} onPress={() => handleSelectContact(item)}>
        <Image source={{ uri: item.image ?? 'https://via.placeholder.com/50' }} style={styles.avatar} />
        <Text style={styles.contactName}>{item.name ?? item.email}</Text>
      </TouchableOpacity>
    )
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity onPress={()=>{
        navigation.navigate('GroupCreate', {email:route.params?.email})
      }}>
        <Text style={styles.title}>+ Create Group</Text>
      </TouchableOpacity>

      {/* Select Contacts */}
      <Text style={styles.subtitle}>Select Contacts</Text>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item._id}
        style={styles.contactList}
      />

      {/* Create Group Button */}
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
