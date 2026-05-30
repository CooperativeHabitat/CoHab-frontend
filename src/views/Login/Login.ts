import {computed, ref} from 'vue';
import {useRouter} from 'vue-router';
import {apiService} from '@/services/api';
import ValidationErrorComponent from "@/error/templates/ValidationErrorComponent.vue";
import {ProblemDetail, ValidationError} from "@/error/types/serverErrorResponses";
import Header from "@/views/header/Header.vue";
import AuthErrorComponent from "@/error/templates/AuthErrorComponent.vue";

export default {
  name: 'LoginView',
  components: {AuthErrorComponent, Header, ValidationErrorComponent, ValidationError: ValidationErrorComponent},
  setup() {
    const router = useRouter();
    const username = ref<string>('');
    const password = ref<string>('');
    const loading = ref<boolean>(false);
    const errorState= ref<{ validationError?: ValidationError | null, authError?: ProblemDetail | null }> ({
      validationError: null,
      authError: null
    });

    const hasErrors = computed(() => {
      let value = errorState.value;
      return value.validationError !== null || value.authError !== null;
    })
    const handleLogin = async (): Promise<void> => {
      loading.value = true;
      try {
        const data = await apiService.post('auth/login', {
          username: username.value,
          password: password.value,
        });
        localStorage.setItem('token', data.body.token);
        localStorage.setItem('tokenExpiresAt', data.body.expiresAt);
        await router.push('/');

      } catch (err: unknown) {
        if(err instanceof ProblemDetail) {
          if(err.title == 'BadCredentialsException')
            errorState.value.authError = err;
          else if(err.title == 'BindException')
            errorState.value.validationError = new ValidationError(err)
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      errorState,
      loading,
      hasErrors,
      handleLogin,
    };
  },
};