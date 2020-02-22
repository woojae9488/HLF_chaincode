import Vue from 'vue'
import Router from 'vue-router'
import api from "@/services/api.js";
import userService from "@/services/userApi.js";

import MakeSurvey from '@/components/MakeSurvey'
import Reply from '@/components/Reply'
import Signin from '@/components/Signin'
import StudentSignup from '@/components/StudentSignup'
import Survey from '@/components/Survey'
import SurveyList from '@/components/SurveyList'
import NotFound from '@/components/NotFound'

Vue.use(Router)

const router = new Router({
    routes: [
        {
            path: '/MakeSurvey',
            name: 'MakeSurvey',
            component: MakeSurvey,
            props: true,
            meta: { authRequired: true, onlyManager: true }
        },
        {
            path: '/Reply/:department/:createdAt/:uid',
            name: 'Reply',
            component: Reply,
            props: true,
            meta: { authRequired: true, onlyManager: false }
        },
        {
            path: '/Signin',
            name: 'Signin',
            component: Signin,
            meta: { authRequired: false, onlyManager: false }
        },
        {
            path: '/StudentSignup',
            name: 'StudentSignup',
            component: StudentSignup,
            meta: { authRequired: false, onlyManager: false }
        },
        {
            path: '/Survey/:department/:createdAt',
            name: 'Survey',
            component: Survey,
            props: true,
            meta: { authRequired: true, onlyManager: false }
        },
        {
            path: '/SurveyList',
            name: 'SurveyList',
            component: SurveyList,
            meta: { authRequired: false, onlyManager: false }
        },
        {
            path: '*',
            name: 'NotFound',
            component: NotFound,
            meta: { authRequired: false, onlyManager: false }
        }
    ]
})

router.beforeEach(async (to, _from, next) => {
    if (to.matched.some(routeInfo => routeInfo.meta.authRequired)) {
        if (await certifyUser()) {
            if (to.matched.some(routeInfo => routeInfo.meta.onlyManager)) {
                if (api.getData("role") !== "manager") {
                    alert('Only Manager can enter');
                    return next('/SurveyList');
                }
            }
        } else {
            alert('Authenticate Fail');
            return next('/Signin');
        }
    }
    return next();
})

const certifyUser = async () => {
    const role = api.getData("role");
    api.setHeader("x-access-token", api.getData("accessToken"));
    api.setHeader("x-refresh-token", api.getData("refreshToken"));

    let apiRes;
    try {
        apiRes = await userService.certifyUser(role);
    } catch (err) {
        if (await reissueToken(err, role)) {
            api.setHeader("x-access-token", api.getData("accessToken"));
            apiRes = await userService.certifyUser(role);
        } else {
            console.log(api.getErrorMsg(err));
            return false;
        }
    }

    const apiData = api.getResultData(apiRes);
    api.setData("user", apiData);
    return true;
}

const reissueToken = async (err, role) => {
    try {
        if (err.response && err.response.status === 401) {
            const tokenRes = await userService.reissueAccessToken(role);
            const tokenData = api.getResultData(tokenRes);
            api.setData("accessToken", tokenData.accessToken);
            return true;
        }
    } catch (err) {
        console.log(api.getErrorMsg(err));
    }
    return false;
}


export default router