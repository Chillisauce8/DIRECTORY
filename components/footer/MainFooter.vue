<template>
    <footer class="the-footer">
        <ImageWrapper cloudinaryId="661fec4e622206049c762a44" :width="2000" class="footer-content">
            <section class="footer-links">
                <template v-for="linkSection in footerLinks" :key="linkSection.title">
                    <reveal-item class="footer mobile" :title="linkSection.title" ifMobile="true" icon="true">
                        <ul v-if="linkSection.links">
                            <template v-for="link in linkSection.links" :key="link.title">
                                <li>
                                    <NuxtLink :to="link.link">{{ link.title }}</NuxtLink>
                                </li>
                            </template>
                        </ul>

                        <address v-if="linkSection.address">
                            <ul>
                                <template v-for="line in linkSection.address" :key="line">
                                    <li>
                                        {{ line }}
                                    </li>
                                </template>
                                <li v-if="currentSection.getPhone()">
                                    <a :href="`tel:${currentSection.getPhone()}`"> {{ currentSection.getPhone() }}</a>
                                </li>
                            </ul>
                        </address>
                        <ul>
                            <li v-if="linkSection.vat">{{ linkSection.vat }}</li>
                            <li v-if="linkSection.companyNumber">
                                {{ linkSection.companyNumber }}
                            </li>
                            <template v-for="hours in linkSection.officeHours" :key="hours">
                                <li>
                                    {{ hours }}
                                </li>
                            </template>
                        </ul>
                    </reveal-item>
                </template>
            </section>
            <section class="social-links Row">
                <template v-for="link in socialLinks" :key="link.icon">
                    <NuxtLink :to="link.link" target="_blank" :aria-label="link.icon">
                        <LazySvgIcon :svg="link.icon" />
                    </NuxtLink>
                </template>
            </section>
            <section class="association-links">
                <template v-for="link in associationLinks" :key="link.icon">
                    <NuxtLink :to="link.link" target="_blank" :aria-label="link.icon">
                        <SvgLogo :svg="link.icon" />
                    </NuxtLink>
                </template>
            </section>
        </ImageWrapper>
    </footer>
</template>

<script>
export default {
    data() {
        return {
            sectionStoreSubscription: undefined,
            footerLinks: [],
            socialLinks: [
                {
                    icon: 'facebook',
                    link: 'https://www.facebook.com/chillisauce'
                },
                {
                    icon: 'twitter',
                    link: 'https://twitter.com/chillisauce'
                },
                {
                    icon: 'pinterest',
                    link: 'https://www.pinterest.co.uk/chillisauce/'
                },
                {
                    icon: 'instagram',
                    link: 'https://www.instagram.com/chillisauceofficial/'
                },
                {
                    icon: 'youtube',
                    link: 'https://www.youtube.com/channel/UC48tz6tU8Mu_xROmHk3dFyg'
                }
            ],
            associationLinks: [
                {
                    icon: 'abta',
                    link: 'https://www.abta.com/abta-member-search/results?search=chillisauce'
                }
            ]
        };
    },
    methods: {
        initFooterLinks() {
            this.footerLinks = [
                {
                    title: 'Departments',
                    links: [
                        {
                            title: 'Stag Do Ideas',
                            link: '/stag'
                        },
                        {
                            title: 'Hen Do Ideas',
                            link: '/hen'
                        },
                        {
                            title: 'Group Weekends',
                            link: '/groups'
                        },
                        {
                            title: 'Corporate Events',
                            link: '/events'
                        },
                        {
                            title: 'Destinations',
                            link: `/locations`
                        },
                        {
                            title: 'Activities',
                            link: `/activities`
                        },
                        {
                            title: 'Blog',
                            link: `/blog`
                        }
                    ]
                },
                {
                    title: 'About Us',
                    links: [
                        {
                            title: 'About Us',
                            link: `/stag/about-8d35db05dcbd37ef2acf`
                        },
                        {
                            title: 'Our Story',
                            link: `/stag/about-448b24199c317f72a3f1`
                        },
                        {
                            title: 'Press',
                            link: `/stag/about-f9e673e2cd82f2c371b2`
                        },
                        {
                            title: 'Suppliers',
                            link: `/stag/about-9a6f234eefd071060bb7`
                        },
                        {
                            title: 'FAQs',
                            link: `/stag/about-5cc1cef0d3cd4e54e02f799b`
                        }
                    ]
                },
                {
                    title: 'Help',
                    links: [
                        {
                            title: 'Contact Us',
                            link: `/stag/about-e622b9219c630a4b2628`
                        },
                        {
                            title: 'Privacy Policy',
                            link: `/stag/about-c2d5cb27e68235e8f9e8`
                        },
                        {
                            title: 'Cookie Policy',
                            link: `/stag/about-5da6f79a450051275efd4abb`
                        },
                        {
                            title: 'Terms and Conditions',
                            link: `/stag/about-5beef1f1a8c297315e8c3584`
                        },
                        {
                            title: 'Financial Protection',
                            link: `/stag/about-80559bc8108b7eb63681`
                        }
                    ]
                },
                {
                    title: 'Contact Us',
                    address: ['Chillisauce Ltd', '1 Paris Gardens', 'London', 'SE1 8ND'],
                    phone: '0207 2991831',
                    vat: 'VAT: 788 193 081',
                    companyNumber: 'Company Number: 0400 2664',
                    officeHours: ['Mon-Weds: 9am - 7.30pm', 'Thurs: 9am - 6.30pm', 'Fri: 9am - 5.30pm', 'Sat & Sun: Closed', 'Closed Bank Holidays']
                }
            ];
        }
    }
};
</script>

<style lang="scss">
.the-footer {
    color: white;
    font-size: 16px;
    line-height: 30px;
    @include links(white, $C31);
    @include mobile() {
        text-align: center;
    }
    & .overlay {
        background-image: linear-gradient(to right, #2c4449, #4a7882);
        opacity: 0.8;
    }
    & .footer-content {
        width: auto;
        height: 400px;
        & .footer-links {
            width: 90%;
            margin-top: 50px;
            & .summary {
                font-size: 18px;
                text-transform: uppercase;
                font-family: var(--primary-font-family);
            }
            @include desktop() {
                display: flex;
                justify-content: space-evenly;
            }

            & address {
                margin-bottom: 10px;
            }
        }
        & .social-links {
            display: flex;
            justify-content: center;
            margin-top: 5%;
            & .icon {
                width: 24px;
                height: 24px;
                margin: 0 12px;
            }
        }
        & .association-links {
            display: flex;
            justify-content: center;
            margin-top: 5%;
            & i {
                width: 100px;
                margin: 0 2px;
                fill: currentColor;
            }
        }
    }
}
</style>
