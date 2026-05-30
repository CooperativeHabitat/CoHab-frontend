import {computed, ref} from 'vue';
import {useRouter} from 'vue-router';
import {apiService} from '@/services/api';
import {ProblemDetail, ValidationError} from "@/error/types/serverErrorResponses";
import ValidationErrorComponent from "@/error/templates/ValidationErrorComponent.vue";
import Header from "@/views/header/Header.vue";
import AuthErrorComponent from "@/error/templates/AuthErrorComponent.vue";

export default {
    name: 'Registration',
    components: {AuthErrorComponent, Header, ValidationErrorComponent},
    setup: function () {
        const router = useRouter();
        const username = ref<string>('');
        const password = ref<string>('');
        const firstname = ref<string>('');
        const lastname = ref<string>('');
        const birthDate = ref<string>('');
        const loading = ref<boolean>(false);
        const errorState= ref<{ validationError?: ValidationError | null }> ({
            validationError: null,
        });

        const hasErrors = computed(() => {

            return errorState.value.validationError !== null;
        })

        const handleRegistration = async (): Promise<void> => {
            loading.value = true;

            try {
                const data = await apiService.post('auth/registration', {
                    username: username.value,
                    password: password.value,
                    firstname: firstname.value,
                    lastname: lastname.value,
                    birthDate: birthDate.value
                });
                localStorage.setItem('token', data.body.token);
                localStorage.setItem('tokenExpiresAt', data.body.expiresAt);
                await router.push('/');

            } catch (err: unknown) {
                if (err instanceof ProblemDetail) {
                    errorState.value.validationError = new ValidationError(err);
                }

            } finally {
                loading.value = false;
            }
        };

        return {
            username,
            password,
            firstname,
            lastname,
            birthDate,
            loading,
            errorState,
            hasErrors,
            handleRegistration,
        };
    },
};