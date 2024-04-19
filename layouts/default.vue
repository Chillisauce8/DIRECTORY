<script setup lang="ts">
const route = useRoute()
const appConfig = useAppConfig()
const { isHelpSlideoverOpen } = useDashboard()

const links = [{
  id: 'home',
  label: 'Home',
  icon: 'i-heroicons-home',
  to: '/',
  tooltip: {
    text: 'Home',
    shortcuts: ['G', 'H']
  }
}, {
  id: 'inbox',
  label: 'Inbox',
  icon: 'i-heroicons-inbox',
  to: '/inbox',
  badge: '4',
  tooltip: {
    text: 'Inbox',
    shortcuts: ['G', 'I']
  }
}, {
  id: 'users',
  label: 'Users',
  icon: 'i-heroicons-user-group',
  to: '/users',
  tooltip: {
    text: 'Users',
    shortcuts: ['G', 'U']
  }
}, {
  id: 'settings',
  label: 'Settings',
  to: '/settings',
  icon: 'i-heroicons-cog-8-tooth',
  children: [{
    label: 'General',
    to: '/settings',
    exact: true
  }, {
    label: 'Members',
    to: '/settings/members'
  }, {
    label: 'Notifications',
    to: '/settings/notifications'
  }],
  tooltip: {
    text: 'Settings',
    shortcuts: ['G', 'S']
  }
}]

const footerLinks = [{
  label: 'Invite people',
  icon: 'i-heroicons-plus',
  to: '/settings/members'
}, {
  label: 'Help & Support',
  icon: 'i-heroicons-question-mark-circle',
  click: () => isHelpSlideoverOpen.value = true
}]

const groups = [{
  key: 'links',
  label: 'Go to',
  commands: links.map(link => ({ ...link, shortcuts: link.tooltip?.shortcuts }))
}, {
  key: 'code',
  label: 'Code',
  commands: [{
    id: 'source',
    label: 'View page source',
    icon: 'i-simple-icons-github',
    click: () => {
      window.open(`https://github.com/nuxt-ui-pro/dashboard/blob/main/pages${route.path === '/' ? '/index' : route.path}.vue`, '_blank')
    }
  }]
}]

const defaultColors = ref(['green', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet'].map(color => ({ label: color, chip: color, click: () => appConfig.ui.primary = color })))
const colors = computed(() => defaultColors.value.map(color => ({ ...color, active: appConfig.ui.primary === color.label })))



const intersectingOptions = {
  //   root: null,
  threshold: 0.1,
  //  rootMargin: '0px',
};

const intersectingCheck = (animateElements: any[]) => {
  animateElements.forEach((element) => {
    if (element.isIntersecting) {
      element.target.classList.add('INTERSECTING');
      element.target.classList.add('VIEWED');

      // if (element.target.id) {
      //   this.intersectedElementsStore.setIntersected(element.target.id);
      // }
    } else {
      if (element.target.classList.contains('INTERSECTING')) {
        element.target.classList.add('VIEWED');
        element.target.classList.remove('INTERSECTING');

        // if (element.target.id) {
        //   this.intersectedElementsStore.resetIntersected(element.target.id);
        // }
      }
    }
  });
};

let intersectingObserver: IntersectionObserver;

function animateIntersecting() {
  const isPlatformBrowser = typeof window !== 'undefined';

  // ANIMATED - Check if Intersecting
  if (isPlatformBrowser) {
    const animateElements = document.querySelectorAll('.ANIMATE:not(.VIEWED)') // Set intersection

    animateElements.forEach((element) => {
      intersectingObserver.observe(element);
    });
  }
}

function animateIntersectingDelayed(delay: number, repeatTimes: number) {
  animateIntersecting();

  if (!repeatTimes) {
    repeatTimes = 1;
  }

  for (let i = 1; i <= repeatTimes; ++i) {
    setTimeout(() => {
      animateIntersecting();
    }, i * delay);
  }
}


onBeforeMount(() => {
  intersectingObserver = new IntersectionObserver(
    intersectingCheck,
    intersectingOptions
  );

  animateIntersectingDelayed(500, 1);

// this.pageDataLoadedStore.$onAction(({name, after}) => {
//   after(() => {
//     if (name === 'set') {
//       this.animateIntersectingDelayed(300, 5);
//     }
//   });
// });
});

onBeforeUnmount(() => {
  intersectingObserver.disconnect();
});

</script>

<template>
  <TopNav />
  <div class="main-page">
    <SideNav/>
    <main><slot /></main>
  </div>
  <MainFooter/>
</template>
<style lang="scss">
.main-page{
  display:flex;
}

</style>
