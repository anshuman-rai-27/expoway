import React, { useState, ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAction, useConvexAuth } from 'convex/react';
import { api } from '../convex/_generated/api';
import { RootStackParamList } from '../App';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

type LoginScreenProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
  const { width } = useWindowDimensions();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const navigation = useNavigation<LoginScreenProp>();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const createVerificationCode = useAction(api.users.sendEmail);

  if (isAuthenticated) {
    directChat();
  }

  async function directChat() {
    const localEmail = await AsyncStorage.getItem('email');
    if (localEmail) {
      navigation.navigate('Chat', { email: localEmail });
    }
  }

  const handleLogin = async () => {
    await createVerificationCode({
      email: email,
      type: 'signIn',
    });
    navigation.navigate('Verification', { email: email, password: password, type: 'signIn' });
  };

  const isDesktop = width >= 900;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthComponent>
      {!isLoading ? (
        <View style={[styles.container, isDesktop && styles.desktopContainer]}>
          {isDesktop && (
            <View style={styles.imageContainer}>
              <ImageBackground
                source={require('@/assets/images/lol.jpg')}
                style={styles.backgroundImage}
                resizeMode="cover"
              >
                <View style={styles.overlay} />
                <View style={styles.imageOverlay}>
                  <Text style={styles.imageText}>BloomChat</Text>
                </View>
              </ImageBackground>
            </View>
          )}
          <View style={[styles.formContainer, isDesktop && styles.desktopFormContainer]}>
            <Text style={styles.title}>Welcome Back!</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#ccc"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#ccc" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.signUp}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.title}>Loading</Text>
      )}
    </AuthComponent>
  );
};

export const AuthComponent = ({ children }: { children: ReactNode }) => {
  return (
    <View style={styles.background}>
      <StatusBar barStyle="light-content" />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  desktopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  imageContainer: {
    flex: 1,
    width: 200,
    height: 800,
    borderRadius: 30,
    borderWidth: 10,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  imageOverlay: {
    padding: 30,
    paddingBottom: 50,
  },
  imageText: {
    color: '#fff',
    fontSize: 60,
    fontWeight: '700',
    textAlign: 'center',
    paddingTop: 320,
  },
  formContainer: {
    width: '100%',
    padding: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginVertical: 30,
  },
  desktopFormContainer: {
    maxWidth: 450,
    marginHorizontal: 40,
  },
  title: {
    fontSize: 34,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '900',
  },
  input: {
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    color: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 25,
    fontSize: 16,
    fontWeight: '500',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 25,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  button: {
    backgroundColor: '#ff6200',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#ff6200',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 2, height: 2 },
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  forgotPassword: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#bbb',
    fontSize: 14,
  },
  signUp: {
    color: '#ff6200',
    marginLeft: 5,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default Login;
