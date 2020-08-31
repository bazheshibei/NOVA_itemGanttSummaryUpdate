
import Vue from 'vue'
import Router from 'vue-router'

import Edit from '@/pages/edit/edit'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/edit', component: Edit, name: '编辑' },
    {
      path: '/',
      component: Edit,
      name: ''
      // beforeEnter: (to, from, next) => {
      //   // page_type:add（新增），edit(编辑），view(查看），audit(审核）
      //   const { page_type = 'add' } = JSON.parse(localStorage.getItem('NOVA_ItemNodeAdjustmentHtml') || '{}')
      //   const name = { 'add': '新增', edit: '编辑', view: '查看', audit: '审核' }
      //   next({ name: name[page_type] })
      // }
    }
    // { path: '*', redirect: { path: '/404' } }
  ]
})

/*
 * [路由守卫]
 */
// router.beforeEach((to, from, next) => {
//
// })
export default router
