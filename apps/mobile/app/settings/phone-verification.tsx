import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { phoneApi } from '@sync/api-client';
import { PHONE_ERROR_MESSAGES, PHONE_SUCCESS_MESSAGES } from '@sync/shared';
import type { PhoneVerificationErrorCode } from '@sync/shared';

type VerificationStep = 'phone' | 'code' | 'success';

export default function PhoneVerificationScreen() {
  const router = useRouter();
  const [step, setStep] = useState<VerificationStep>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [canResend, setCanResend] = useState(false);

  const codeInputRef = useRef<TextInput>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check existing verification status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await phoneApi.getStatus();
        if (status.verified) {
          setStep('success');
          setPhone(status.phone || '');
        }
      } catch {
        // Not verified yet, continue with phone entry
        console.log('No existing phone verification');
      }
    };
    checkStatus();
  }, []);

  // Countdown timer for code expiry
  useEffect(() => {
    if (expiresIn !== null && expiresIn > 0) {
      timerRef.current = setInterval(() => {
        setExpiresIn((prev) => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const formatPhone = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    // Format as 05X-XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    // Only allow digits and formatting
    const cleaned = text.replace(/[^\d-]/g, '');
    const formatted = formatPhone(cleaned.replace(/-/g, ''));
    setPhone(formatted);
    setError(null);
  };

  const handleCodeChange = (text: string) => {
    // Only allow 6 digits
    const digits = text.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError(null);
  };

  const handleSendCode = async () => {
    const rawPhone = phone.replace(/-/g, '');

    // Validate phone number (Israeli mobile: 05X followed by 7 digits)
    if (!/^05[0-9]{8}$/.test(rawPhone)) {
      setError(PHONE_ERROR_MESSAGES.INVALID_PHONE);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await phoneApi.sendCode(rawPhone);

      if (response.success) {
        setStep('code');
        setExpiresIn(response.expiresIn || 600); // Default 10 minutes
        setCanResend(false);
        // Focus code input after transition
        setTimeout(() => codeInputRef.current?.focus(), 100);
      } else {
        const errorCode = response.error as PhoneVerificationErrorCode;
        setError(PHONE_ERROR_MESSAGES[errorCode] || 'שגיאה בשליחת הקוד');
      }
    } catch (err: unknown) {
      console.error('Error sending code:', err);
      setError(PHONE_ERROR_MESSAGES.SMS_SEND_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError(PHONE_ERROR_MESSAGES.INVALID_CODE);
      return;
    }

    const rawPhone = phone.replace(/-/g, '');
    setLoading(true);
    setError(null);

    try {
      const response = await phoneApi.verifyCode(rawPhone, code);

      if (response.success && response.verified) {
        Keyboard.dismiss();
        setStep('success');
        Alert.alert('הצלחה', PHONE_SUCCESS_MESSAGES.PHONE_VERIFIED);
      } else {
        const errorCode = response.error as PhoneVerificationErrorCode;
        setError(PHONE_ERROR_MESSAGES[errorCode] || 'קוד שגוי');
      }
    } catch (err: unknown) {
      console.error('Error verifying code:', err);
      setError(PHONE_ERROR_MESSAGES.WRONG_CODE);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode('');
    setCanResend(false);
    await handleSendCode();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPhoneStep = () => (
    <View className="flex-1 px-5">
      <Text className="text-neutral-600 font-assistant text-right mb-6">
        הזינו את מספר הטלפון הישראלי שלכם לאימות באמצעות SMS.
      </Text>

      <View className="mb-4">
        <Text className="font-heebo text-neutral-700 text-right mb-2">מספר טלפון</Text>
        <View className="flex-row-reverse items-center bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-200">
          <Ionicons name="call-outline" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 font-assistant text-neutral-900 text-right mx-3"
            placeholder="050-123-4567"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={handlePhoneChange}
            maxLength={12}
            editable={!loading}
          />
          <Text className="font-assistant text-neutral-500">+972</Text>
        </View>
      </View>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <Text className="font-assistant text-red-600 text-right">{error}</Text>
        </View>
      )}

      <Pressable
        className={`rounded-xl py-4 items-center ${
          loading || phone.replace(/-/g, '').length < 10
            ? 'bg-neutral-200'
            : 'bg-primary-600 active:bg-primary-700'
        }`}
        onPress={handleSendCode}
        disabled={loading || phone.replace(/-/g, '').length < 10}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="font-heebo font-semibold text-white">שליחת קוד אימות</Text>
        )}
      </Pressable>
    </View>
  );

  const renderCodeStep = () => (
    <View className="flex-1 px-5">
      <Text className="text-neutral-600 font-assistant text-right mb-2">
        הזינו את קוד האימות שנשלח למספר:
      </Text>
      <Text className="font-heebo font-semibold text-primary-600 text-right mb-6">
        {phone}
      </Text>

      <View className="mb-4">
        <Text className="font-heebo text-neutral-700 text-right mb-2">קוד אימות</Text>
        <TextInput
          ref={codeInputRef}
          className="bg-neutral-50 rounded-xl px-4 py-4 font-heebo text-2xl text-center tracking-widest border border-neutral-200"
          placeholder="000000"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={code}
          onChangeText={handleCodeChange}
          maxLength={6}
          editable={!loading}
        />
      </View>

      {expiresIn !== null && expiresIn > 0 && (
        <Text className="text-neutral-500 font-assistant text-center mb-4">
          הקוד תקף עוד {formatTime(expiresIn)}
        </Text>
      )}

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <Text className="font-assistant text-red-600 text-right">{error}</Text>
        </View>
      )}

      <Pressable
        className={`rounded-xl py-4 items-center mb-3 ${
          loading || code.length !== 6
            ? 'bg-neutral-200'
            : 'bg-primary-600 active:bg-primary-700'
        }`}
        onPress={handleVerifyCode}
        disabled={loading || code.length !== 6}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="font-heebo font-semibold text-white">אימות</Text>
        )}
      </Pressable>

      <View className="flex-row-reverse justify-between items-center">
        <Pressable onPress={() => setStep('phone')} disabled={loading}>
          <Text className="font-assistant text-neutral-600">שינוי מספר</Text>
        </Pressable>

        {canResend ? (
          <Pressable onPress={handleResendCode} disabled={loading}>
            <Text className="font-assistant text-primary-600">שליחה מחדש</Text>
          </Pressable>
        ) : (
          <Text className="font-assistant text-neutral-400">שליחה מחדש</Text>
        )}
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View className="flex-1 px-5 items-center justify-center">
      <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
        <Ionicons name="checkmark-circle" size={48} color="#10B981" />
      </View>

      <Text className="font-heebo text-xl font-semibold text-neutral-900 text-center mb-2">
        הטלפון אומת בהצלחה
      </Text>

      <Text className="font-assistant text-neutral-600 text-center mb-2">
        המספר הבא מאומת:
      </Text>

      <Text className="font-heebo font-semibold text-primary-600 text-lg mb-8">
        {phone}
      </Text>

      <Pressable
        className="bg-primary-600 rounded-xl py-4 px-8 active:bg-primary-700"
        onPress={() => router.back()}
      >
        <Text className="font-heebo font-semibold text-white">חזרה לאימות</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row-reverse items-center px-5 py-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-forward" size={24} color="#374151" />
        </Pressable>
        <Text className="flex-1 text-lg font-heebo font-semibold text-neutral-900 text-right mr-4">
          אימות טלפון
        </Text>
      </View>

      {/* Progress indicator */}
      {step !== 'success' && (
        <View className="flex-row-reverse px-5 py-4 gap-2">
          <View className={`flex-1 h-1 rounded-full ${step === 'phone' || step === 'code' ? 'bg-primary-600' : 'bg-neutral-200'}`} />
          <View className={`flex-1 h-1 rounded-full ${step === 'code' ? 'bg-primary-600' : 'bg-neutral-200'}`} />
        </View>
      )}

      {/* Content */}
      <View className="flex-1 pt-4">
        {step === 'phone' && renderPhoneStep()}
        {step === 'code' && renderCodeStep()}
        {step === 'success' && renderSuccessStep()}
      </View>
    </SafeAreaView>
  );
}
