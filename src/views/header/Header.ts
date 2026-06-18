import {getLoginState} from "@/services/loginStateResolver.ts";
import { HomeIcon, UserIcon, LogOutIcon } from 'lucide-vue-next'
import {authService} from "@/services/authService.ts";
import router from "@/router";
import NotificationDropdown from './NotificationDropdown.vue'

export default {
    name: 'Header',
    components: {           
        HomeIcon,          
        UserIcon,           
        LogOutIcon,
        NotificationDropdown
    }, 

    setup() {
        const {loginState} = getLoginState();

        const handleLogoutClick = () => {
            authService.logout();
            return router.push('/login');
        }
        const handleProfileClick = () => {
            console.log('handleProfileClick')
        }

        return{
            state: loginState,
            handleProfileClick,
            handleLogoutClick,
        }
    }
}