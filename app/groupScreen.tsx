import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
  Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome5';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { NavigationProp, RouteProp, useNavigation } from '@react-navigation/native';
import { useConvex, useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { RootStackParamList } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Id } from '../convex/_generated/dataModel';
import { useRouter, useLocalSearchParams } from 'expo-router';

import Chatbox from './groupChat';
const { width, height } = Dimensions.get('window');

type chatScreenProp = NativeStackNavigationProp<RootStackParamList, "Chat">

const GroupChatScreen = (
  // { route }: { route: RouteProp<any> }
) => {
  const [chats, setChats] = useState<any[]>([]);
  const [friendChat, setFriendChat] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<chatScreenProp>();
  const removeFriend = useMutation(api.users.removeFriendShip)
  const router = useRouter(); // Using router from expo-router
  const { email } = useLocalSearchParams();
  
  const friends = useQuery(api.users.getFriendShip, {
    fromEmail:email as string
  })
  const user = useQuery(api.users.getUser,{
    email:email as string
  })
  const group = useQuery(api.groups.getGroupWithEmail,{
    email:email as string
  })
  
  const filteredChats = chats.filter((chat: any) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFriendChat = friendChat.filter((chat: any) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())??chat.email.toLowerCase().includes(searchQuery.toLowerCase()) 
  );
  

  const deleteChat = (id: Id<'groups'>) => {
    setChats((prev: any) => prev.filter((chat: any) => chat._id !== id));
    
  };
  const deleteFriendChat = async (id: Id<'users'>) => {
    setFriendChat((prev: any) => prev.filter((chat: any) => chat._id !== id));
    await removeFriend({from:user?._id!, to:id})
    
  };

  const handleLongPress = (id: Id<'groups'>) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteChat(id), style: "destructive" }
      ]
    );
  };
  const handleFriendLongPress = (id: Id<'users'>) => {
    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteFriendChat(id), style: "destructive" }
      ]
    );
  };

  // Animation for the add button
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleAddButtonPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1, // Scale up
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1, // Scale back
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    router.push({ pathname: '/dmCreate', params: { email: email } });
  };

  // Animation for bottom navigation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, // Final opacity value
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);
  useEffect(()=>{
    setChats(group?.data ?? [])
  },[group])
  useEffect(()=>{
    setFriendChat(friends ?? [])
  },[friends])

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onLongPress={() => handleLongPress(item._id)}
      onPress={() => {
        // navigation.navigate('GroupChat', { groupId: item._id, email: route.params?.email });
        router.push({ pathname: '/groupChat', params: { groupId: item._id, email: email } });
      }}
      style={styles.chatItem}
    >
      <Image source={{ uri: item.image ?? "https://via.placeholder.com/50" }} style={styles.avatar} />
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
  const renderFriendChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onLongPress={() => handleFriendLongPress(item._id)}
      onPress={() => {
        router.push({pathname:'/dm', params:{ toId: item._id, fromId:user?._id! }});
      }}
      style={styles.chatItem}
    >
      <Image source={{ uri: item.image ?? "https://via.placeholder.com/50" }} style={styles.avatar} />
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.name ?? item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.containerbox}>
    <View style={styles.mainbox}>
    
    

    
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>BloomChats</Text>
        <TouchableOpacity onPress={()=>{ router.push({pathname:'/userProfile',params:{email:email as string}})
        }} >
          <Icon name="ellipsis-v" size={18} color="#fff"   />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#bbb" style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#bbb"
          style={styles.searchBar}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[styles.chatList, { paddingBottom: height * 0.2 }]}
          />
          
     
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddButtonPress}>
        <Icon name="plus" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navbar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={()=>{
          router.push({pathname:'/chatScreen',params:{email:email as string}})
        }}>
          <Icon name="home" size={20} color="#bbb" />
          <Text style={styles.navIcons}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={()=>{
          router.push({ pathname: '/groupScreen', params: { email } });
        }}>
          <Icon name="users" size={20} color="#DD651B" />
          <Text style={styles.navIcons}>Groups</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={()=>{
          router.push({pathname:'/billSplit',params:{email:email as string}})
        }}>
          <Icon name="money-bill-alt" size={20} color="#bbb" />
          <Text style={styles.navIcons}>Bill Split</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={()=>{
          // router.push({ pathname: '/call', params: { email } });
        }}>
          <Icon name="phone-alt" size={20} color="#bbb" />
          <Text style={styles.navIcons}>Calls</Text>
        </TouchableOpacity>


      

       

          </View>
          </View>
        </View>
      <View style={styles.leftbox}>
      
        <Chatbox/>
  

 </View>

      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  containerbox: {
    flex: 1,
    flexDirection: 'row',
  },
  mainbox: {
    flex: 0.3,
    width: '30%',
    height: '100%',
  },
  leftbox: {
    flex: 0.7,
    width: '150%',
    height: '100%',
    borderRadius: 10,
  
  },
  
  navIcons: {
    fontSize: 12,
    fontWeight: '800',
    color:'#bbb',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 25,
    paddingStart:2,
    marginBottom: 16,
    width: '90%',
    height:'5%',
  },
  searchIcon: {
    marginLeft: 18,
    marginRight:5,
  },
  searchBar: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  chatList: {
    alignItems: 'center',
    
   
  },
  chatItem: {
   
    flexDirection: 'row',
    alignItems: 'center',
    padding: 36,
    marginBottom: 12,
    width: '100%',
    height:'25%',
    // backgroundColor: 'white',
    marginRight: 3,
    paddingLeft:10,

  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 60,
  },
  chatDetails: {
    flex: 1,
    color:'white'
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  marginRight:100,
    // backgroundColor:'brown'
  },
  fab: {
    position: 'absolute',
    bottom: 80,
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#121212',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
  },
});

export default GroupChatScreen;