import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons
import { api } from '../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeBase64 } from 'tweetnacl-util';
import { decryptSecretKey, encrypt } from '../utils';
import { Id } from '../convex/_generated/dataModel';
import { box } from "tweetnacl";
import { useRouter, useLocalSearchParams } from 'expo-router';
import ChatScreen from './chatScreen';

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 380; // Height for each list item
const VISIBLE_ITEMS = 1; // Number of items visible in the scroll view

interface Amounts {
  [key: string]: number;
}

const BillSplit = (
  // { route }: { route: RouteProp<any> }
) => {
  const defaultUserIcon = 'https://via.placeholder.com/100';
  const contacts = useQuery(api.users.getAllUserWithPublicKey)
  const router = useRouter(); // Using router from expo-router
  const { email } = useLocalSearchParams();
  const user = useQuery(api.users.getUser, {
    email: email as string
  })
  const sessions = useQuery(api.session.getSession, {
    userId: user?._id
  })
  const createFriendship = useMutation(api.users.createFriendship);
  const create = useMutation(api.message.createDmMessage);

  // Filter out duplicates based on name
  const uniqueContacts = contacts?.filter((contact, index, self) =>
    index === self.findIndex((c) => c.name === contact.name)
  );

  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [amounts, setAmounts] = useState<Amounts>({});
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [splitMethod, setSplitMethod] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1); // Track steps in UI
  const [expenseName, setExpenseName] = useState<string>(''); // Optional expense name

  const [priv, setPriv] = useState<Uint8Array>();

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const initializePrivateKey = async () => {
      try {
        if (user?.email && sessions) {
          const privd = JSON.parse((await AsyncStorage.getItem(user.email))!);
          const session = sessions?.find((session) => session._id === privd.sessionId)
          const privk = decryptSecretKey(session?.secret!, privd.privkey)
          const privKey = decodeBase64(privk);
          setPriv(privKey);
        }
      } catch (error) {
        console.error(error);
      }
    }
    initializePrivateKey();
  }, [sessions, user])

  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const index = Math.round(value / ITEM_HEIGHT);
      setActiveIndex(index % selectedUsers.length);
    });
    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY, selectedUsers.length]);

  const toggleSelectUser = (user: any) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(user)
        ? prevSelectedUsers.filter((u) => u !== user)
        : [...prevSelectedUsers, user]
    );
  };

  const assignAmount = (user: any, amount: string) => {
    const updatedAmounts: { [x: string]: number } = { ...amounts, [user]: parseFloat(amount) || 0 };
    setAmounts(updatedAmounts);
    // const newTotal = Object.values(updatedAmounts).reduce(
    //   (sum:number, value:number) => sum +value,
    //   0
    // );

    const newTotal = Object.values(updatedAmounts).reduce((sum, value) => {
      return sum + value;
    }, 0)
    setTotalAmount(newTotal);

    // Check if amounts assigned to all users
    if (Object.keys(updatedAmounts).length === selectedUsers.length) {
      // setActiveIndex(0); // Reset the index after assigning to all....................This will craete bugs so don't use :)!
    }
  };

  const proceedToAssignAmounts = () => {
    if (selectedUsers.length === 0) {
      Alert.alert('No users selected', 'Please select at least one user.');
      return;
    }
    setStep(2);
  };

  const proceedToFinalList = () => {
    if (splitMethod === 'assignManually' && Object.keys(amounts).length !== selectedUsers.length) {
      Alert.alert('Incomplete', 'Please assign amounts to all selected users.');
      return;
    }
    setStep(3);
  };

  const goBack = () => {
    setStep(step === 3 ? 2 : 1);
  };

  const sendMessage = async (message:string, fromId:Id<'users'>, toId:Id<'users'>, toPublicKey:string)=>{
    await createFriendship({from:fromId, to:toId})
    const sharedKey = box.before(decodeBase64(toPublicKey), priv!);
    await create({
      toUser:toId,
      fromUser:fromId,
      content:encrypt(sharedKey, message.trim())
    })
    return 
  }


  const finalizeAndSendAmounts = async () => {
    selectedUsers.forEach(async (toUser) => {
      const userAmount = amounts[toUser.name];
      await sendMessage(`Your share is ₹${userAmount}, you need to pay to ${user?.name}`, user?._id!, toUser?._id, toUser?.publicKey )
      Alert.alert(`Notification`, `Sent to ${toUser.name}: Your share is ₹${userAmount}. Total: ₹${totalAmount}`);
    });
  };

  const renderItem = ({ item,index}: { item: any, index:number}) => {
    
    const contact = uniqueContacts?.find((c) => c.name === item.name);
    const position = Animated.subtract(index * ITEM_HEIGHT, scrollY);
    const opacity = position.interpolate({
      inputRange: [-ITEM_HEIGHT, 0, ITEM_HEIGHT],
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });
    const scale = position.interpolate({
      inputRange: [-ITEM_HEIGHT, 0, ITEM_HEIGHT],
      outputRange: [0.8, 1.2, 0.8],
      extrapolate: 'clamp',
    });

      return (
       
                  
      <Animated.View style={[styles.item, { opacity, transform: [{ scale }] }]}>
        <Image
          source={{ uri: contact?.image || defaultUserIcon }}
          style={styles.userImage}
        />
        <Text style={styles.itemText}>{item.name}</Text>
      </Animated.View>
    );
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  const infiniteScrollHandler = (event: any) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(contentOffsetY / ITEM_HEIGHT) % selectedUsers.length;
    setActiveIndex(index < 0 ? selectedUsers.length - 1 : index);
  };

  const isFinalizeEnabled = Object.keys(amounts).length === selectedUsers.length;

    return (
        <View style={styles.containerbox}>
        <View style={styles.mainbox}>
        <ChatScreen/>
              </View>
              
              <View style={styles.leftbox}>
    <View style={styles.container}>
      {/* Back icon, visible for steps 2 and 3 */}
      {step > 1 && (
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {step === 1 && (
        <>
          <Text style={styles.header}>Split Bill</Text>
          <Text>Select Contacts</Text>
          <ScrollView>
            {uniqueContacts?.filter((contact) => contact._id !== user?._id).map((contact) => (
              <TouchableOpacity
                key={contact.name}
                style={[
                  styles.contactItem,
                  selectedUsers.includes(contact) ? styles.selectedContact : null,
                ]}
                onPress={() => toggleSelectUser(contact)}
              >
                <Image
                  source={{ uri: contact.image || defaultUserIcon }}
                  style={styles.contactImage}
                />
                <Text style={styles.contactName}>{contact.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={proceedToAssignAmounts}
          >
            <Text style={styles.confirmButtonText}>Proceed to Assign</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Animated.FlatList
            ref={flatListRef}
            data={selectedUsers} // No duplicate users
            keyExtractor={(item,index) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            onMomentumScrollEnd={infiniteScrollHandler}
          />
          <Text style={styles.scrollText}>
            Scroll for next...
          </Text>
          <View style={styles.amountContainer}>
            <Text style={styles.activeUserText}>
              Assign amount to {selectedUsers[activeIndex].name}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              keyboardType="numeric"
              placeholderTextColor="#aaa"
              defaultValue={amounts[selectedUsers[activeIndex].name] ? amounts[selectedUsers[activeIndex].name].toString() : ''}
              onChangeText={(value) => {
                console.log(selectedUsers[activeIndex], activeIndex)
                if(selectedUsers[activeIndex]){
                  assignAmount(selectedUsers[activeIndex].name, value)
                }
              
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.confirmButton2}
            onPress={() => scrollToIndex(activeIndex + 1)}
          >
            <Text style={styles.confirmButtonText}>Next User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.finalizeButton, isFinalizeEnabled && { backgroundColor: '#DD651B' }]}
            onPress={proceedToFinalList}
          // disabled={!isFinalizeEnabled}
          >
            <Text style={styles.confirmButtonText}>Finalize</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.header3}>Final Amounts</Text>
          <FlatList
            data={selectedUsers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              console.log(item, amounts)
              return(
              <View style={styles.finalItem}>
                <Text style={styles.finalUser}>{item.name}</Text>
                <Text style={styles.finalAmount}>₹{amounts[item.name] || 0}</Text>
              </View>
            )}}
          />
          <Text style={styles.totalText}>Total Amount: ₹{totalAmount}</Text>
          <TouchableOpacity style={styles.confirmButton} onPress={finalizeAndSendAmounts}>
            <Text style={styles.confirmButtonText}>Send Amounts</Text>
          </TouchableOpacity>
        </>
      )}
              </View>
              </View>
              </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
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
        zIndex:10,
       
        backgroundColor:'#000',
      
        },

  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DD651B',
    marginBottom: 30,
    marginTop: 5,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
    height: ITEM_HEIGHT,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  itemText: {
    color: '#fff',
    fontSize: 18,
  },
  scrollText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  amountContainer: {
    marginVertical: 20,
  },
  activeUserText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#DD651B',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  confirmButton2: {
    backgroundColor: '#bbb',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  finalizeButton: {
    backgroundColor: '#bbb',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  finalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 20,
    padding: 10,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
  },
  finalUser: {
    color: '#fff',
  },
  finalAmount: {
    color: '#fff',
  },
  totalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedContact: {
    backgroundColor: '#bbb',
  },
  contactImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  contactName: {
    color: '#fff',
  },
  header3: {
    marginTop: 75,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginLeft: 80,

  },
});

export default BillSplit;
