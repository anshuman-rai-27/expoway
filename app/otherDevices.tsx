import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { decryptSecretKey, encryptSecretKey } from '../utils';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const OtherDevicesScreen = (
    // { route }: { route: RouteProp<any> }
) => {
    const [sessions, setSessions] = useState<any[]>([{
        _id: 1,
        secret: "life could be dream",
        userId: "life could be dream",
        code: "",
        type: "PERMANENT"
    },
    {
        _id: 2,
        secret: "life could be dream",
        userId: "life could be dream",
        code: "",
        type: "PERMANENT"
    }
    ]);
    const router = useRouter();
    const { email} = useLocalSearchParams();
    const [sessionId, setSessionId] = useState<Id<'sessions'>>();
    const [code, setCode] = useState('');
    const updateSession = useMutation(api.session.updateTempSession);
    const verifySession = useMutation(api.session.verifyTempSession);
    const storage = useAsyncStorage(email as string)
    const deviceSession = useQuery(api.session.getSessionById, {
        sessionId:sessionId
    });
    
    const removeSession = useMutation(api.session.removeSession);
    const user = useQuery(api.users.getUser, {
        email: email as string
    })
    const session = useQuery(api.session.getSession, {
        userId: user?._id
    })

    useEffect(()=>{
        storage.getItem().then((response)=>{
            const userData = JSON.parse(response!)
            setSessionId(userData.sessionId);
        })  
    },[])

    useEffect(()=>{
        
    },[session])

    const handleRemoveSession = async (id: Id<'sessions'>) => {
        Alert.alert(
            'Remove Session',
            'Are you sure you want to remove this session?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    onPress: async () => {
                        await removeSession({ sessionId: id });
                        setSessions((prev) => prev.filter((session) => session._id !== id));
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    // Handle code submission
    const handleAddSession = async () => {
        if (code.trim()) {
            //   await addSession({ code, email: route.params.email });
            const sessionData = await verifySession({ code: code, userId: user?._id! })
            if (sessionData?.error) {
                Alert.alert('Invalid Code', 'Please enter a valid session code.');
            } else {
                const userDetail = await AsyncStorage.getItem(user?.email!)
                const deviceInfo: { sessionId: Id<'sessions'>, privkey: string } = JSON.parse(userDetail!);
                const privkey = decryptSecretKey(deviceSession?.secret!, deviceInfo.privkey)
                await updateSession({
                    sessionId: sessionData?.data?.sessionId!,
                    type: "PERMANENT",
                    secret: encryptSecretKey(privkey, sessionData?.data?.secret!)
                })
            }
            setCode('');
        } else {
            Alert.alert('Invalid Code', 'Please enter a valid session code.');
        }
    };

    const renderSessionItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onLongPress={() => handleRemoveSession(item._id)}
            style={styles.sessionItem}
        >
            <View style={styles.sessionDetails}>
                <Text style={styles.sessionName}>SessionID:{item._id}</Text>
                {/* <Text style={styles.sessionTime}>{item.lastActive}</Text> */}
            </View>
            <Icon name="trash" size={20} color="#bbb" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Other Devices</Text>
            </View>

            {/* Active Sessions List */}
            <FlatList
                data={sessions}
                renderItem={renderSessionItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.sessionList}
            />

            {/* Code Entry for Adding New Session */}
            <View style={styles.addSessionContainer}>
                <TextInput
                    placeholder="Enter Code"
                    placeholderTextColor="#bbb"
                    value={code}
                    onChangeText={setCode}
                    style={styles.codeInput}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddSession}>
                    <Text style={styles.addButtonText}>Add Session</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        alignItems: 'center',
        paddingTop: 40,
    },
    header: {
        width: '90%',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    sessionList: {
        alignItems: 'center',
        paddingBottom: height * 0.2,
    },
    sessionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width * 0.9,
        padding: 16,
        backgroundColor: '#1E1E1E',
        marginBottom: 12,
        borderRadius: 10,
    },
    sessionDetails: {
        flex: 1,
    },
    sessionName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    sessionTime: {
        fontSize: 14,
        color: '#bbb',
    },
    addSessionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width * 0.9,
        marginTop: 20,
    },
    codeInput: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        color: '#fff',
        padding: 10,
        borderRadius: 25,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: '#DD651B',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default OtherDevicesScreen;
