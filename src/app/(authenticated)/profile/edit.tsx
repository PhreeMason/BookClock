import AppHeader from '@/components/shared/AppHeader';
import CustomInput from '@/components/shared/CustomInput';
import { ThemedScrollView, ThemedText, ThemedView } from '@/components/themed';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ProfileFormData, profileFormSchema } from '@/lib/profileFormSchema';
import { useTheme } from '@/theme';
import { isClerkAPIResponseError, useUser } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const mapClerkErrorToFormField = (error: any) => {
    switch (error.meta?.paramName) {
        case 'first_name':
            return 'firstName';
        case 'last_name':
            return 'lastName';
        default:
            return 'root';
    }
};

export default function EditProfileScreen() {
    const { user } = useUser();
    const { theme } = useTheme();
    const borderColor = theme.border;
    const iconColor = theme.primary;

    const [isLoading, setIsLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
        },
    });

    const handleBackPress = () => {
        router.back();
    };

    const handleImagePicker = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (permissionResult.granted === false) {
                Alert.alert(
                    'Permission Required',
                    'Please allow access to your photo library to change your profile picture.',
                    [{ text: 'OK' }]
                );
                return;
            }

            Alert.alert(
                'Select Photo',
                'Choose how you want to select your profile photo',
                [
                    {
                        text: 'Camera',
                        onPress: () => openCamera(),
                    },
                    {
                        text: 'Photo Library',
                        onPress: () => openImagePicker(),
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                ]
            );
        } catch (error) {
            console.error('Error requesting permissions:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to access photo library'
            });
        }
    };

    const openCamera = async () => {
        try {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
            
            if (cameraPermission.granted === false) {
                Alert.alert(
                    'Permission Required',
                    'Please allow access to your camera to take a profile picture.',
                    [{ text: 'OK' }]
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
                await updateProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error opening camera:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to open camera'
            });
        }
    };

    const openImagePicker = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
                await updateProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error opening image picker:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to open photo library'
            });
        }
    };

    const updateProfileImage = async (imageUri: string) => {
        try {
            setIsImageLoading(true);
            
            // Convert image to base64 for Clerk
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            // Create data URL with base64
            const dataUrl = `data:image/jpeg;base64,${base64}`;
            
            await user?.setProfileImage({ file: dataUrl });
            
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Profile image updated successfully'
            });
        } catch (error) {
            console.error('Error updating profile image:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update profile image'
            });
        } finally {
            setIsImageLoading(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            // Update first name and last name
            await user?.update({
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
            });

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Profile updated successfully'
            });

            router.back();
        } catch (err) {
            console.error('Error updating profile:', err);

            if (isClerkAPIResponseError(err)) {
                err.errors.forEach((error) => {
                    const fieldName = mapClerkErrorToFormField(error);
                    setError(fieldName as keyof ProfileFormData | 'root', {
                        message: error.longMessage || error.message || 'An error occurred',
                    });
                });
            } else {
                setError('root', { message: 'Failed to update profile' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const getUserInitials = () => {
        if (!user) return 'U';
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const avatarStyle = {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.primary,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    };

    const imageStyle = {
        width: 100,
        height: 100,
        borderRadius: 50,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <ThemedView backgroundColor="background" style={styles.container}>
                <AppHeader title="Edit Profile" onBack={handleBackPress} />

                <ThemedScrollView backgroundColor="background" style={styles.content}>
                    {/* Profile Image Section */}
                    <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
                        <View style={styles.imageSection}>
                            <View style={avatarStyle}>
                                {user?.imageUrl ? (
                                    <Image source={{ uri: user.imageUrl }} style={imageStyle} />
                                ) : (
                                    <ThemedText style={styles.initialsText}>
                                        {getUserInitials()}
                                    </ThemedText>
                                )}
                            </View>
                            
                            <TouchableOpacity 
                                style={[styles.changePhotoButton, { borderColor }]}
                                onPress={handleImagePicker}
                                disabled={isImageLoading}
                            >
                                <IconSymbol name="camera.fill" size={16} color={iconColor} />
                                <ThemedText style={styles.changePhotoText}>
                                    {isImageLoading ? 'Updating...' : 'Change Photo'}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>

                    {/* Profile Information Form */}
                    <ThemedView backgroundColor="card" borderColor="border" style={styles.section}>
                        <ThemedText type="semiBold" style={styles.sectionTitle}>Profile Information</ThemedText>
                        
                        <View style={styles.formField}>
                            <ThemedText style={styles.fieldLabel}>First Name</ThemedText>
                            <CustomInput
                                control={control}
                                name="firstName"
                                placeholder="Enter your first name"
                                editable={!isLoading}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.formField}>
                            <ThemedText style={styles.fieldLabel}>Last Name</ThemedText>
                            <CustomInput
                                control={control}
                                name="lastName"
                                placeholder="Enter your last name"
                                editable={!isLoading}
                                autoCapitalize="words"
                            />
                        </View>


                        {/* Display root errors */}
                        {errors.root && (
                            <ThemedText color="danger" style={styles.rootError}>
                                {errors.root.message}
                            </ThemedText>
                        )}
                    </ThemedView>

                    {/* Action Buttons */}
                    <View style={styles.buttonSection}>
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: iconColor, opacity: isLoading ? 0.6 : 1 }]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading}
                        >
                            <ThemedText style={styles.saveButtonText}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor }]}
                            onPress={handleCancel}
                            disabled={isLoading}
                        >
                            <ThemedText color="textMuted" style={styles.cancelButtonText}>
                                Cancel
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </ThemedScrollView>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 20,
        marginBottom: 20,
    },
    imageSection: {
        alignItems: 'center',
    },
    initialsText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 40,
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderRadius: 8,
    },
    changePhotoText: {
        marginLeft: 8,
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 16,
        marginBottom: 16,
    },
    formField: {
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    rootError: {
        marginTop: 8,
        fontSize: 14,
    },
    buttonSection: {
        marginBottom: 40,
    },
    saveButton: {
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        borderRadius: 8,
        borderWidth: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
});