<template>
  <div class="Signin">
    <h2 class="pb-4">{{ title }}</h2>

    <b-card
      header="Signin"
      header-tag="h5"
      border-variant="success"
      header-border-variant="success"
      align="left"
    >
      <b-container fluid>
        <b-form @submit.prevent="signin">
          <b-row class="my-2">
            <b-col sm="3">
              <b-form-radio-group
                id="role-radio-group"
                v-model="loginData.role"
                :options="roleOptions"
                button-variant="info"
                name="role-radios"
                size="sm"
                buttons
              ></b-form-radio-group>
            </b-col>
          </b-row>

          <b-row class="my-3" align-v="center">
            <b-col sm="3">
              <label for="user-id">Id :</label>
            </b-col>
            <b-col sm="9">
              <b-form-input
                id="user-id"
                v-model="loginData.id"
                placeholder="Enter your ID"
                trim
                required
              ></b-form-input>
            </b-col>
          </b-row>

          <b-row class="my-3" align-v="center">
            <b-col sm="3">
              <label for="user-password">Password :</label>
            </b-col>
            <b-col sm="9">
              <b-form-input
                type="password"
                id="user-password"
                v-model="loginData.password"
                placeholder="Enter your Password"
                trim
                required
              ></b-form-input>
            </b-col>
          </b-row>

          <b-row class="my-4" align-h="center">
            <b-col sm="13">
              <b-button type="submit" variant="primary">Signin</b-button>
            </b-col>
          </b-row>

          <b-row v-if="isStudent" class="my-1" align-h="center">
            <b-col sm="13">
              <b-link to="/StudentSignup">Signup</b-link>
            </b-col>
          </b-row>
        </b-form>
      </b-container>
    </b-card>
  </div>
</template>

<script>
import api from '@/services/api';
import authService from '@/services/authApi';
import eventBus from '@/utils/eventBus';

export default {
  name: 'Signin',
  data() {
    return {
      title: 'Welcome to JNU Survey App',
      roleOptions: ['student', 'manager'],
      loginData: {
        role: 'student',
        id: '',
        password: '',
      },
    };
  },
  computed: {
    isStudent() {
      return this.loginData.role === 'student';
    },
  },
  created() {
    if (this.checkValidity()) {
      this.$router.push('/SurveyList');
    }
  },
  methods: {
    checkValidity() {
      return Boolean(api.getData('accessToken') && api.getData('refreshToken'));
    },

    async signin() {
      try {
        eventBus.$emit('runSpinner');

        api.setData('role', this.loginData.role);
        const apiRes = await authService.signin(this.loginData.id, this.loginData.password);
        const apiData = api.getResultData(apiRes);
        api.setData('accessToken', apiData.accessToken);
        api.setData('refreshToken', apiData.refreshToken);

        this.$router.push('/SurveyList');
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert('Fail to signin');
      } finally {
        eventBus.$emit('hideSpinner');
      }
    },
  },
};
</script>
