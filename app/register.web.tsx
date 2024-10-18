import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { AuthComponent } from '@/app/index';

type RegisterScreenProp = NativeStackNavigationProp<any, 'Register'>;

const Register = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<RegisterScreenProp>();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Password validation states
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const validatePassword = (password: string) => {
    const length = password.length >= 8;
    const uppercase = /[A-Z]/.test(password);
    const number = /\d/.test(password);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordValidations({
      length,
      uppercase,
      number,
      specialChar,
    });

    return length && uppercase && number && specialChar;
  };

  const handlePasswordChange = (password: string) => {
    setPassword(password);
    validatePassword(password);
  };

  const handleRegister = async () => {
    if (!validatePassword(password)) {
      setError('Error: Password does not meet the required criteria');
      return;
    }

    if (password !== confirmPassword) {
      setError('Error: Passwords do not match');
      return;
    }

    setError('');
    // Proceed with registration logic
    navigation.navigate('Verification', { email, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isDesktop = width >= 900;

  return (
    <AuthComponent>
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
          <Text style={styles.title}>Create an Account</Text>

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
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordValidationContainer}>
            <View style={styles.validationItem}>
              <Icon
                name={passwordValidations.length ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={passwordValidations.length ? '#00ff00' : '#ff0000'}
              />
              <Text style={styles.validationText}>
                At least 8 characters
              </Text>
            </View>
            <View style={styles.validationItem}>
              <Icon
                name={passwordValidations.uppercase ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={passwordValidations.uppercase ? '#00ff00' : '#ff0000'}
              />
              <Text style={styles.validationText}>
                One uppercase letter
              </Text>
            </View>
            <View style={styles.validationItem}>
              <Icon
                name={passwordValidations.number ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={passwordValidations.number ? '#00ff00' : '#ff0000'}
              />
              <Text style={styles.validationText}>
                One number
              </Text>
            </View>
            <View style={styles.validationItem}>
              <Icon
                name={passwordValidations.specialChar ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={passwordValidations.specialChar ? '#00ff00' : '#ff0000'}
              />
              <Text style={styles.validationText}>
                One special character
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#ccc"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text style={styles.signUp}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AuthComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  desktopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    width: 200,
    height: 800,
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
  passwordValidationContainer: {
    marginBottom: 20,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  validationText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#ff6200',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: '#ff3333',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
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
    fontWeight: 'bold',
  },
});

export default Register;
