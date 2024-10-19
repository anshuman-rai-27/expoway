// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Alert,
//   StyleSheet,
//   TouchableOpacity,
//   ImageBackground,
//   ScrollView,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import * as ImagePicker from 'expo-image-picker';

// const BotCreationPage: React.FC = () => {
//   const [step, setStep] = useState(1);
//   const [botName, setBotName] = useState('');
//   const [description, setDescription] = useState('');
//   const [commands, setCommands] = useState<string[]>(['']);
//   const [actions, setActions] = useState<string[]>(['']);
//   const [mediaFiles, setMediaFiles] = useState<string[]>(['']);
//   const [links, setLinks] = useState<string[]>(['']);
//   const [tags, setTags] = useState<string[]>(['']);

//   const handleNextStep = () => {
//     if (step === 1) {
//       if (botName.trim() === '') {
//         Alert.alert('Error', 'Bot name cannot be empty');
//         return;
//       }
//       setStep(2);
//     } else if (step === 2) {
//       if (commands.some(command => command.trim() === '')) {
//         Alert.alert('Error', 'All commands must be filled');
//         return;
//       }
//       setStep(3);
//     }
//   };

//   const handleCreateBot = () => {
//     Alert.alert('Success',` Bot "${botName}" created successfully!`);
//     setBotName('');
//     setDescription('');
//     setCommands(['']);
//     setActions(['']);
//     setMediaFiles(['']);
//     setLinks(['']);
//     setTags(['']);
//     setStep(1);
//   };

//   const handleBackPress = () => {
//     if (step > 1) {
//       setStep(step - 1);
//     } else {
//       Alert.alert('Back button pressed');
//     }
//   };

//   const handleAddCommand = () => {
//     if (commands.length < 2) {
//       setCommands([...commands, '']);
//       setActions([...actions, '']);
//       setMediaFiles([...mediaFiles, '']);
//       setLinks([...links, '']);
//       setTags([...tags, '']);
//     } else {
//       Alert.alert('Limit Reached', 'You can only add up to 2 commands.');
//     }
//   };

//   const handleCommandChange = (index: number, value: string) => {
//     const newCommands = [...commands];
//     newCommands[index] = value;
//     setCommands(newCommands);
//   };

//   const handleActionChange = (index: number, value: string) => {
//     const newActions = [...actions];
//     newActions[index] = value;
//     setActions(newActions);
//   };

//   const handleMediaChange = async (index: number) => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission Denied', 'Permission to access media library is required!');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.All,
//     });

//     if (!result.canceled) {
//       const newMediaFiles = [...mediaFiles];
//       newMediaFiles[index] = result.assets[0].uri;
//       setMediaFiles(newMediaFiles);
//     }
//   };

//   const handleLinkChange = (index: number, value: string) => {
//     const newLinks = [...links];
//     newLinks[index] = value;
//     setLinks(newLinks);
//   };

//   const handleTagChange = (index: number, value: string) => {
//     const newTags = [...tags];
//     newTags[index] = value;
//     setTags(newTags);
//   };

//   return (
//     <ImageBackground
//       source={
//         step === 1
//           ? {uri:'https://fefevs.sirv.com/botPage.jpg'}
//           : step === 2
//           ? {uri:'https://fefevs.sirv.com/botPage2.jpg'}
//           : {uri:'https://fefevs.sirv.com/botPage3.jpg'}
//       }
//       style={styles.container}
      
//     >
//       <KeyboardAvoidingView
//         style={{ flex: 1, width: '100%' }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <Text style={styles.heading}>Create Bot</Text>

//         <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
//           <Image
//             source={require('../assets/images/back.png')}
//             style={styles.backImage}
//           />
//         </TouchableOpacity>

//         {step === 1 && (
//           <View style={styles.step1}>
//             <Text style={styles.title}>Step 1 of 3</Text>
//             <Text style={styles.label}>Bot Name</Text>
//             <TextInput
//               style={styles.input}
//               value={botName}
//               onChangeText={setBotName}
//               placeholder="Enter bot name"
//             />
//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               style={styles.input}
//               value={description}
//               onChangeText={setDescription}
//               placeholder="Enter bot description"
//               multiline
//             />
//             <TouchableOpacity style={styles.createButton} onPress={handleNextStep}>
//               <Text style={styles.buttonText}>Next</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {step === 2 && (
//           <ScrollView style={styles.page2}>
//             <Text style={styles.title2}>Step 2 of 3</Text>
//             {commands.map((command, index) => (
//               <View key={index} style={styles.commandContainer}>
//                 <Text style={styles.label}>Command {index + 1}</Text>
//                 <TextInput
//                   style={styles.input}
//                   value={command}
//                   onChangeText={value => handleCommandChange(index, value)}
//                   placeholder="Enter command (e.g., /bot)"
//                 />
//                 <Text style={styles.label}>Action</Text>
//                 <Picker
//                   selectedValue={actions[index]}
//                   style={styles.picker}
//                   onValueChange={value => handleActionChange(index, value)}
//                 >
//                   <Picker.Item label="Select Action" value="" />
//                   <Picker.Item label="Add Media" value="add_media" />
//                   <Picker.Item label="Add Link" value="add_link" />
//                   <Picker.Item label="Add Message Tag" value="add_message_tag" />
//                 </Picker>
//                 {actions[index] === 'add_media' && (
//                   <TouchableOpacity
//                     style={styles.input}
//                     onPress={() => handleMediaChange(index)}
//                   >
//                     <Text style={styles.placeholderText}>
//                       {mediaFiles[index] ? 'Media Selected' : 'Add media file'}
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//                 {actions[index] === 'add_link' && (
//                   <TextInput
//                     style={styles.input}
//                     value={links[index]}
//                     onChangeText={value => handleLinkChange(index, value)}
//                     placeholder="Enter link"
//                   />
//                 )}
//                 {actions[index] === 'add_message_tag' && (
//                   <TextInput
//                     style={styles.input}
//                     value={tags[index]}
//                     onChangeText={value => handleTagChange(index, value)}
//                     placeholder="Define tag"
//                   />
//                 )}
//               </View>
//             ))}
//             <TouchableOpacity style={styles.addButton} onPress={handleAddCommand}>
//               <Icon name="add" size={30} color="#DD651B" />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.createButton} onPress={handleNextStep}>
//               <Text style={styles.buttonText}>Next</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         )}

// {step === 3 && (
//           <View style={styles.page3}>
//             <Text style={styles.title}>Step 3 of 3</Text>
//             <Text style={styles.confirmationText}>Confirm Bot Creation</Text>
//             <Text style={styles.summary}>Bot Name: {botName}</Text>
//             <Text style={styles.summary}>Description: {description}</Text>
//             <Text style={styles.summary2}>Commands:</Text>
//             {commands.map((command, index) => (
//               <Text key={index} style={styles.summary}>
//                 {command} → {actions[index] || 'No action'}{' '}
//                 {actions[index] === 'add_media' && `| Media: ${mediaFiles[index]}`}
//                 {actions[index] === 'add_link' && `| Link: ${links[index]}`}
//                 {actions[index] === 'add_message_tag' && `| Tag: ${tags[index]}`}
//               </Text>
//             ))}
//             <TouchableOpacity style={styles.createButton} onPress={handleCreateBot}>
//               <Text style={styles.buttonText}>Create Bot</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </KeyboardAvoidingView>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor:"#000"
//   },
//   heading: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: 'white',
//     marginLeft: 20,
//   },
//   backButton: {
//     position: 'absolute',
//     top: 10,
//     left: 10,
//   },
//   backImage: {
//     width: 0,
//     height: 0,
    
//   },
//   step1: {
//     width: '30%',
//     marginLeft: 900,
//     alignItems: 'center',
//     paddingTop: 60,

//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#DD651B',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     fontSize: 16,
//     marginVertical: 10,
//     width: '100%',
//     color: 'white',
//     backgroundColor: '#1E1E1E',
//   },
//   createButton: {
//     backgroundColor: '#DD651B',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   addButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//   },
//   placeholderText: {
//     color: 'grey',
//   },
//   label: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#DD651B',
//     marginTop: 10,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: 'white',
//   },
//   title2: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#DD651B',
//   },
//   commandContainer: {
//     marginBottom: 20,
//   },
//   picker: {
//     width: '100%',
//     height: 50,
//     color: 'white',
//     backgroundColor: '#1E1E1E',
//     borderWidth: 1,
//     borderRadius: 8,
//     borderColor: '#DD651B',
//   },
//   confirmationText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: 'white',
//   },
//   summary: {
//     fontSize: 16,
//     color: 'white',
//     marginVertical: 10,
//   },
//   summary2: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#DD651B',
//     marginTop: 10,
//   },
//   page2: {
//     width: '30%',
//     marginLeft: 900,
    
//     paddingTop: 60,
//   },
//   page3: {
//     width: '30%',
//     marginLeft: 900,
   
//     paddingTop: 60,
//   },
// });

// export default BotCreationPage;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

const BotCreationPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [botName, setBotName] = useState('');
  const [description, setDescription] = useState('');
  const [commands, setCommands] = useState<string[]>(['']);
  const [actions, setActions] = useState<string[]>(['']);
  const [mediaFiles, setMediaFiles] = useState<string[]>(['']);
  const [links, setLinks] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['']);

  const handleNextStep = () => {
    if (step === 1) {
      if (botName.trim() === '') {
        Alert.alert('Error', 'Bot name cannot be empty');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (commands.some(command => command.trim() === '')) {
        Alert.alert('Error', 'All commands must be filled');
        return;
      }
      setStep(3);
    }
  };

  const handleCreateBot = () => {
    Alert.alert('Success', `Bot "${botName}" created successfully!`);
    setBotName('');
    setDescription('');
    setCommands(['']);
    setActions(['']);
    setMediaFiles(['']);
    setLinks(['']);
    setTags(['']);
    setStep(1);
  };

  const handleBackPress = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      Alert.alert('Back button pressed');
    }
  };

  const handleAddCommand = () => {
    if (commands.length < 2) {
      setCommands([...commands, '']);
      setActions([...actions, '']);
      setMediaFiles([...mediaFiles, '']);
      setLinks([...links, '']);
      setTags([...tags, '']);
    } else {
      Alert.alert('Limit Reached', 'You can only add up to 2 commands.');
    }
  };

  const handleCommandChange = (index: number, value: string) => {
    const newCommands = [...commands];
    newCommands[index] = value;
    setCommands(newCommands);
  };

  const handleActionChange = (index: number, value: string) => {
    const newActions = [...actions];
    newActions[index] = value;
    setActions(newActions);
  };

  const handleMediaChange = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });

    if (!result.canceled) {
      const newMediaFiles = [...mediaFiles];
      newMediaFiles[index] = result.assets[0].uri;
      setMediaFiles(newMediaFiles);
    }
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  return (
    <ImageBackground
      source={
        step === 1
          ? require('../assets/images/botPage.jpg')
          : step === 2
          ? require('../assets/images/botPage2.jpg')
          : require('../assets/images/botPage3.jpg')
      }
      style={styles.container}
      
    >
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.heading}>Create Bot</Text>

        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image
            source={require('../assets/images/back.png')}
            style={styles.backImage}
          />
        </TouchableOpacity>

        {step === 1 && (
          <View style={styles.step1}>
            <Text style={styles.title}>Step 1 of 3</Text>
            <Text style={styles.label}>Bot Name</Text>
            <TextInput
              style={styles.input}
              value={botName}
              onChangeText={setBotName}
              placeholder="Enter bot name"
            />
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter bot description"
              multiline
            />
            <TouchableOpacity style={styles.createButton} onPress={handleNextStep}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <ScrollView style={styles.page2}>
            <Text style={styles.title2}>Step 2 of 3</Text>
            {commands.map((command, index) => (
              <View key={index} style={styles.commandContainer}>
                <Text style={styles.label}>Command {index + 1}</Text>
                <TextInput
                  style={styles.input}
                  value={command}
                  onChangeText={value => handleCommandChange(index, value)}
                  placeholder="Enter command (e.g., /bot)"
                />
                <Text style={styles.label}>Action</Text>
                <Picker
                  selectedValue={actions[index]}
                  style={styles.picker}
                  onValueChange={value => handleActionChange(index, value)}
                >
                  <Picker.Item label="Select Action" value="" />
                  <Picker.Item label="Add Media" value="add_media" />
                  <Picker.Item label="Add Link" value="add_link" />
                  <Picker.Item label="Add Message Tag" value="add_message_tag" />
                </Picker>
                {actions[index] === 'add_media' && (
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => handleMediaChange(index)}
                  >
                    <Text style={styles.placeholderText}>
                      {mediaFiles[index] ? 'Media Selected' : 'Add media file'}
                    </Text>
                  </TouchableOpacity>
                )}
                {actions[index] === 'add_link' && (
                  <TextInput
                    style={styles.input}
                    value={links[index]}
                    onChangeText={value => handleLinkChange(index, value)}
                    placeholder="Enter link"
                  />
                )}
                {actions[index] === 'add_message_tag' && (
                  <TextInput
                    style={styles.input}
                    value={tags[index]}
                    onChangeText={value => handleTagChange(index, value)}
                    placeholder="Define tag"
                  />
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={handleAddCommand}>
              <Icon name="add" size={30} color="#DD651B" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={handleNextStep}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {step === 3 && (
          <View style={styles.page3}>
            <Text style={styles.title}>Step 3 of 3</Text>
            <Text style={styles.confirmationText}>Confirm Bot Creation</Text>
            <Text style={styles.summary}>Bot Name: {botName}</Text>
            <Text style={styles.summary}>Description: {description}</Text>
            <Text style={styles.summary2}>Commands:</Text>
            {commands.map((command, index) => (
              <Text key={index} style={styles.summary}>
                {command} → {actions[index] || 'No action'}{' '}
                {actions[index] === 'add_media' && `| Media: ${mediaFiles[index]}`}
                {actions[index] === 'add_link' && `| Link: ${links[index]}`}
                {actions[index] === 'add_message_tag' && `| Tag: ${tags[index]}`}
              </Text>
            ))}
            <TouchableOpacity style={styles.createButton} onPress={handleCreateBot}>
              <Text style={styles.buttonText}>Create Bot</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"#000"
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  backImage: {
    width: 0,
    height: 0,
    
  },
  step1: {
    width: '30%',
    marginLeft: 900,
    alignItems: 'center',
    paddingTop: 60,

  },
  input: {
    borderWidth: 1,
    borderColor: '#DD651B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginVertical: 10,
    width: '100%',
    color: 'white',
    backgroundColor: '#1E1E1E',
  },
  createButton: {
    backgroundColor: '#DD651B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  placeholderText: {
    color: 'grey',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DD651B',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  title2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#DD651B',
  },
  commandContainer: {
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    height: 50,
    color: 'white',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#DD651B',
  },
  confirmationText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  summary: {
    fontSize: 16,
    color: 'white',
    marginVertical: 10,
  },
  summary2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DD651B',
    marginTop: 10,
  },
  page2: {
    width: '30%',
    marginLeft: 900,
    
    paddingTop: 60,
  },
  page3: {
    width: '30%',
    marginLeft: 900,
   
    paddingTop: 60,
  },
});

export default BotCreationPage;