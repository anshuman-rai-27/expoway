import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { RootStackParamList } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { api } from "../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Icon from 'react-native-vector-icons/FontAwesome6';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from "expo-router";
import { Id } from '@/convex/_generated/dataModel';

const themes = [
  { id: 1, name: 'Orange Theme', backgroundImage: {uri: 'https://anshuman.sirv.com/ethos/chat1.jpg'}, myBubble: '#DD651B', theirBubble: '#333' },
  { id: 2, name: 'Violet Theme', backgroundImage: {uri: 'https://anshuman.sirv.com/ethos/chat_violet.jpg'}, myBubble: '#6A0DAD', theirBubble: '#333' },
  { id: 3, name: 'Minimal Theme', backgroundImage: {uri: 'https://anshuman.sirv.com/ethos/chat_white.jpg'}, myBubble: '#333', theirBubble: '#000000' },
  { id: 4, name: 'Yellow Theme', backgroundImage: {uri: 'https://anshuman.sirv.com/ethos/chat_yellow.jpg'}, myBubble: '#EAB613', theirBubble: '#333' },
  { id: 5, name: 'Pink Theme', backgroundImage: {uri: 'https://anshuman.sirv.com/ethos/chat_pink.jpg'}, myBubble: '#DA70A5', theirBubble: '#333' },
];

type groupChatScreenProp = NativeStackNavigationProp<RootStackParamList, "GroupChat">;

const Chatbox = (
  // { route }: { route: RouteProp<any> }
) => {
  const router = useRouter();
  const { email , groupId } = useLocalSearchParams();
  const groupUserId = groupId as Id<'groups'>;
  const user = useQuery(api.users.getUser, { email: email as string });
  const navigation = useNavigation<groupChatScreenProp>()
  const group = useQuery(api.groups.getGroup, { groupId: groupUserId   });
  const messages = useQuery(api.message.getMessageByGroupId, { groupId: groupUserId  });
  const create = useMutation(api.message.createMessage);

  // State to manage the current theme and message input
  const [selectedTheme, setSelectedTheme] = useState(themes[0]); // Default theme is now Orange
  const [isModalVisible, setModalVisible] = useState(false); // For the theme selector modal
  const [priv, setPriv] = useState<Uint8Array>();
  const [message, setMessage] = useState<string>("");
  const [receiveUser, setReceiveUser] = useState<any>();
  const [sharedKey, setSharedKey] = useState<Uint8Array>();
  const [expire, setExpire] = useState<boolean>(false);

  const renderMessage = ({ item }: { item: any }) => {
    const time = new Date(Math.floor(item._creationTime)).toTimeString()
    return (
      <View style={item.from === user!._id ? [styles.myMessageBubble, { backgroundColor: selectedTheme.myBubble }] : [styles.theirMessageBubble, { backgroundColor: selectedTheme.theirBubble }]}>
        <Text style={item.from === user!._id ? styles.myMessageText : styles.theirMessageText}>
          {item.content}
          <Text style={{
            color: '',
            paddingHorizontal: 2,
            fontSize: 8,
            fontWeight: 600,
            marginLeft: 'auto'
          }}>
            {time.substring(0, time.lastIndexOf(':'))}
          </Text>
        </Text>
      </View>)
  }
  // Toggle modal visibility
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Send message function
  const sendMessage = async () => {
    if (message.trim()) {
      await create({
        groupId: groupUserId ,
        from: user!._id,
        isExpiry: expire,
        content: message.trim()
      })
    }
    setMessage('');
  };

  return (
    <ImageBackground
      source={selectedTheme.backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            navigation.navigate('Chat', { email: email as string });
          }} style={styles.backButton}>
            <Icon
              name="angle-left"
              style={styles.iconImage} // Using the correct style here
            />
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Image
              // source={require('../assets/images/user.png')} // Replace with the user image path
              src={group?.data?.groupInfo?.avatar ?? 'https://via.placeholder.com/50'}
              style={styles.userImage}
            />
            <Text style={styles.userName}>{group?.data?.groupInfo?.name ?? receiveUser?.email}</Text>
          </View>

          <TouchableOpacity style={styles.videoCallIcon} onPress={() => {
            navigation.navigate('CallPage', { email: email as string, groupId: groupUserId , name: "" })
          }}>
            <Image
              source={{uri: 'https://anshuman.sirv.com/ethos/video_call.png'}} // Replace with the user image path
              style={styles.userImage}
            />

          </TouchableOpacity>

          {/* Three-Dot Button for Theme Selection */}
          <TouchableOpacity style={styles.threeDotButton} onPress={toggleModal}>
            <Text style={styles.threeDotText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for Theme Selection */}
        <Modal transparent={true} visible={isModalVisible} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Theme</Text>
              {themes.map((theme) => (
                <Pressable
                  key={theme.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedTheme(theme);
                    toggleModal();
                  }}
                >
                  <View style={styles.themeOption}>
                    <View style={[styles.colorCircle, { backgroundColor: theme.myBubble }]} />
                    <Text style={styles.modalOptionText}>{theme.name}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </Modal>

        {/* Message List */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messageList}
        />

        {/* Message Input Section */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.messageInput, { borderColor: selectedTheme.myBubble }]}
            placeholder="Type a message..."
            placeholderTextColor="#ccc"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: selectedTheme.myBubble }]}
            onPress={() => {
              setExpire(!expire)
            }}
          >
            {/* <Text style={styles.sendButtonText}>Send</Text> */}
            <Icon style={{color:'white'}} name="clock-rotate-left" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: selectedTheme.myBubble }]}
            onPress={sendMessage}
          >
            {/* <Text style={styles.sendButtonText}>Send</Text> */}
            <FontAwesomeIcon style={{color:'white'}} name="send" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },

  videoCallIcon: {
    marginLeft: 8,
    marginRight: -70,

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 0,
  },
  backButton: {
    paddingRight: 0,
    paddingTop: 2,
    marginRight: -20,
    justifyContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -35,
    marginRight: 20,
  },
  userImage: {
    width: 30,

    height: 30,
    borderRadius: 20,
    marginRight: 10,

  },
  userName: {
    color: '#fff',
    fontSize: 12,

  },
  threeDotButton: {
    padding: 10,
  },
  threeDotText: {
    color: 'white',
    fontSize: 24,
  },
  messageList: {
    paddingBottom: 100,
  },
  myMessageBubble: {
    borderRadius: 10,
    borderTopRightRadius: 0,
    padding: 10,
    marginVertical: 5,
    alignSelf: 'flex-end',
    maxWidth: '80%',
    position: 'relative',
  },
  theirMessageBubble: {
    borderRadius: 10,
    borderTopLeftRadius: 0,
    padding: 10,
    marginLeft: 2,
    marginVertical: 5,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    position: 'relative',
  },
  triangleMyMessage: {
    position: 'absolute',
    bottom: -5,
    right: 1,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderTopWidth: 10,
  },
  triangleTheirMessage: {
    position: 'absolute',

    top: 1,
    left: -3,
    width: 0,
    height: 2,

    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderTopWidth: 10,
  },
  myMessageText: {
    color: '#fff',
    fontSize: 16,
  },
  theirMessageText: {
    color: '#fff',
    fontSize: 16,
  },

  // Icon image style
  iconImage: {
    fontSize: 40,

    color: "white"
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 250,
    padding: 20,
    backgroundColor: '#000',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color:'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalOption: {
    marginVertical: 5,
    width: '100%',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color:'white'
  },

  // Input styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  messageInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    color: '#fff',
    backgroundColor: '#000',
    marginBottom: 15,
  },
  sendButton: {
    marginLeft: 10,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    color:"white"
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Chatbox;

