import Vue from 'vue';
import Router from 'vue-router';
import api from '@/services/api';
import authService from '@/services/authApi';

import ChangeInfo from '@/pages/ChangeInfo';
import ManagerSignup from '@/pages/ManagerSignup';
import MakeSurvey from '@/pages/MakeSurvey';
import Replies from '@/pages/Replies';
import Reply from '@/pages/Reply';
import Signin from '@/pages/Signin';
import StudentSignup from '@/pages/StudentSignup';
import Survey from '@/pages/Survey';
import SurveyList from '@/pages/SurveyList';
import NotFound from '@/pages/NotFound';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/Signin',
    },
    {
      path: '/ChangeInfo',
      name: 'ChangeInfo',
      component: ChangeInfo,
      meta: { authRequired: true, onlyManager: false },
    },
    {
      path: '/ManagerSignup',
      name: 'ManagerSignup',
      component: ManagerSignup,
      meta: { authRequired: true, onlyManager: true },
    },
    {
      path: '/MakeSurvey',
      name: 'MakeSurvey',
      component: MakeSurvey,
      meta: { authRequired: true, onlyManager: true },
    },
    {
      path: '/MakeSurvey/:department/:createdAt',
      name: 'UpdateSurvey',
      component: MakeSurvey,
      props: true,
      meta: { authRequired: true, onlyManager: true },
    },
    {
      path: '/Replies/:department/:surveyCreatedAt',
      name: 'Replies',
      component: Replies,
      props: true,
      meta: { authRequired: true, onlyManager: true },
    },
    {
      path: '/Reply/:department/:surveyCreatedAt/:uid',
      name: 'Reply',
      component: Reply,
      props: true,
      meta: { authRequired: true, onlyManager: false },
    },
    {
      path: '/Signin',
      name: 'Signin',
      component: Signin,
      meta: { authRequired: false, onlyManager: false },
    },
    {
      path: '/StudentSignup',
      name: 'StudentSignup',
      component: StudentSignup,
      meta: { authRequired: false, onlyManager: false },
    },
    {
      path: '/Survey/:department/:createdAt',
      name: 'Survey',
      component: Survey,
      props: true,
      meta: { authRequired: true, onlyManager: true },
    },
    {
      path: '/SurveyList',
      name: 'SurveyList',
      component: SurveyList,
      meta: { authRequired: true, onlyManager: false },
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound,
      meta: { authRequired: false, onlyManager: false },
    },
  ],
});

const reissueToken = async error => {
  try {
    if (error.response && error.response.status === 401) {
      const tokenRes = await authService.reissueAccessToken();
      const tokenData = api.getResultData(tokenRes);
      api.setData('accessToken', tokenData.accessToken);
      return true;
    }
  } catch (err) {
    console.log(api.getErrorMsg(err));
  }
  return false;
};

const certifyUser = async () => {
  api.setHeader('x-access-token', api.getData('accessToken'));
  api.setHeader('x-refresh-token', api.getData('refreshToken'));

  let apiRes;
  try {
    apiRes = await authService.certifyUser();
  } catch (err) {
    if (await reissueToken(err)) {
      api.setHeader('x-access-token', api.getData('accessToken'));
      apiRes = await authService.certifyUser();
    } else {
      console.log(api.getErrorMsg(err));
      return false;
    }
  }

  const apiData = api.getResultData(apiRes);
  api.setData('user', apiData);
  return true;
};

router.beforeEach(async (to, _from, next) => {
  if (to.matched.some(routeInfo => routeInfo.meta.authRequired)) {
    if (await certifyUser()) {
      if (to.matched.some(routeInfo => routeInfo.meta.onlyManager)) {
        if (api.getData('role') !== 'manager') {
          alert('Only Manager can enter');
          return next('/SurveyList');
        }
      }
    } else {
      alert('Fail to Authentication');
      return next('/Signin');
    }
  }
  return next();
});

export default router;
