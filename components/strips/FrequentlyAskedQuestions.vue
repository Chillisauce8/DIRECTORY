<template>
    <section-wrapper title="FAQs" class="frequently-asked-questions W1">
        <reveal-item v-for="qna in qnas" :key="qna.question" :title="qna.question" icon="true">
            <div class="answer">{{ qna.answer }}</div>
        </reveal-item>
    </section-wrapper>
</template>

<script>
export default {
    data() {
        return {
            open: false,
            qnas: [
                {
                    question: 'Why is it called a stag do?',
                    answer: "A stag do, also known as a stag party or bachelor party, is a pre-wedding celebration for the groom-to-be. The term 'stag', comes from old British hunting terms, where single males would hunt together in packs like stags. This group of men would come to be known as 'stags' and the tradition of a pre-wedding celebration for the groom has been linked with this term ever since. Today, a stag do is typically a weekend away with the groom's closest friends before his wedding day."
                },
                {
                    question: 'How long does a stag do typically last?',
                    answer: 'Stag dos usually last between one and three nights - occasionally up to a week. Analysis of our last years bookings shows that 24% were for 1 night, 56% for 2 nights and 20% for 3 nights or more. Generally if you are going abroad, it will be for 2 nights or more.'
                },
                {
                    question: 'Who usually pays for the stag on stag do?',
                    answer: 'We did some analysis of our past bookings and in 15% of cases the groom pays for their full weekend, in 12% of cases the groom pays for part of their weekend, and in 73% of cases the rest of the group pay for the stags place in full. With the Chillisauce payment system it make it easy to set up all these possibilities so everyone knows the situation and no one is left out of pocket.'
                },
                {
                    question: 'What makes a good stag do?',
                    answer: "Generally speaking its pretty hard not to have a good time when you gather together as a group of mates - so what could be more important to ask is what makes a bad stag do. The main things we hear going wrong are down to poor planning - activities not being booked in, not finding out if places accept stag parties or not, finding out you can't get in a nightclub because of the fancy dress you're wearing. Lets face it, there can be no greater way to deflate a great day than not being able to get in any pubs and clubs because you didn't plan adequately and spending the end of the night wandering around in the poring rain looking for anywhere to take you in. Luckily if book with Chillisauce all our venues take stags and you'll be on the guest-list - we've also got an emergency 24hr weekend helpline to get you out of any unexpected sticky situations."
                },
                {
                    question: 'Who typically arranges the stag do?',
                    answer: 'Traditionally the arrangement of the stag do falls to the best man. We have some data on this and we see that 77% of stag weekends are organised by the best man, 10% are organised by another member of the stag 7% are organised by the groom, 4% are organised by the best mans other half - and a surprising 2% are organised by the bride to be! (Hmm - it would be an interesting case study to see how long those marriages last!)'
                },
                {
                    question: 'What is a good budget for a stag do?',
                    answer: "The cost of a stag do can vary greatly depending on what you're planning and how many people are attending. For an evening out, you should plan to set aside at least £100 per person for food and drinks. If you're planning a weekend away then you should aim to budget £200-£300 per person for activities, accommodation and food. Data over the past year from all our booked stag weekends shows that the 'average' spend on a stag do is now £254."
                },
                {
                    question: 'What should I consider when planning a stag do?',
                    answer: "Key things to consider are the date of the event - when can most people make it? What you think is a good budget for the event, and what you think will get the group going. Often you'll have some people on the stag do that don't really know the rest of the group, so its good to get everyone together early, make the introductions and make sure no one feels left out."
                },
                {
                    question: 'What should the guests bring to the stag do?',
                    answer: "When it comes to a stag do, each guest should bring along any money they need for activities and drinks. Guests should also bring their own comfortable clothes and shoes, depending on the type of event you're having – for example, if you are going paintballing then it may be a good idea to wear old clothes that you don't mind getting dirty. Finally, everyone should bring along a good sense of humour and an enthusiasm for having fun!"
                },
                {
                    question: 'What are the most popular locations for a stag do?',
                    answer: 'Most stag dos take place in a city, as there is usually plenty to do and many bars/clubs to choose from. Some of the most popular UK cities for stag dos include London, Manchester, Liverpool, Edinburgh and Brighton. For those looking to go abroad, European destinations like Prague, Amsterdam, Budapest, Benidorm and Krakow are very popular choices. You can find a full list of the our stag do location here. This is a list of the current top 10 most popular stag do locations: Benidorm, Newcastle, Prague, Budapest, Liverpool, Bristol, Bournemouth, Cardiff, Dublin, Manchester'
                },
                {
                    question: 'Are there any tips for staying safe on a stag do?',
                    answer: "Stag dos can often involve alcohol and activities that can be dangerous if not taken seriously. To ensure everyone stays safe, the groom should set some ground rules for before and during the event, such as making sure nobody drives after drinking alcohol. Make sure that if you're doing a pub crawl, everyone knows where they are going and don't leave anyone to wander off on their own. Finally, make sure that someone has all of your contact details in case you get separated from the group or find yourself needing help."
                },
                {
                    question: 'Should the father-in-law go on the stag do?',
                    answer: "This is a tricky one – ultimately, it's up to the groom and father-in-law to decide if they would like to attend the stag do together. Generally speaking though - this would be an unusual situation, and based on our data only around 2% of stag do's would include the father-in-law."
                },
                {
                    question: 'What are some common rules for a stag do?',
                    answer: "Most stag dos have some basic rules that everyone should follow. Firstly, make sure that the groom enjoys himself - after all, it's his special weekend! Secondly, respect the other guests and try to keep conversations lighthearted and polite - especially if you are not on first name terms. Thirdly, and probably most importantly - what goes on tour stays on tour!"
                },
                {
                    question: 'What are the most popular things to do on a stag do?',
                    answer: 'In order of popularity these are the top 10 most popular stag do activities: Nightclubs, Bar Crawls, Paintball, Go Karting, Zorb Football, Quad Biking, Foot Golf, Off Road Karting, Clay Pigeon Shooting, Escape Rooms'
                },
                {
                    question: 'What tips do you have on choosing a stag do location?',
                    answer: "When choosing a stag do location, there are a few things to consider. Firstly, pick somewhere that suits the budget and interests of the group. Check where members of the group have been before and what they thought about them. Depending on the group, you might want somewhere that has a very lively nightlife, or alternatively somewhere that has a lot of traditional 'good old boozers'. Get a rough idea of where everyone lives and bear that in mind when looking for where may or may not be easier for everyone to get to. If you are looking to go abroad, find out where and when flights go from, and get a rough idea of price. At Chillisauce we ask all our customers to give a review of the location after they have been on their stag do. You can find these reviews on each of the location pages so they can be really helpful in getting some first hand feedback on what to expect."
                },
                {
                    question: 'Can you invite people to the stag do but not the wedding?',
                    answer: 'Yes, of course! If there are people who you would like to invite to the stag do but not the wedding itself, then this is completely acceptable.'
                },
                {
                    question: 'What are some good competitive stag do activities?',
                    answer: 'Competitive activities are a great way to bring the whole group together for some good-natured rivalry. Popular competitive stag do activities include bubble football, foot golf, go karting and clay pigeon shooting.'
                },
                {
                    question: 'What are some good team stag do activities?',
                    answer: 'Getting the group to work in teams can be a great way to build up team bonding. Paintball is one of the most popular stag do activities and is a great event for getting the group to work together. Other great team bonding activities include raft building, and coasteering.'
                },
                {
                    question: 'Who do you invite to the stag do?',
                    answer: "When it comes to deciding who to invite to the stag do, it's best to keep it limited to close friends and family of the groom. This way, everyone involved can feel comfortable being themselves and enjoying the weekend. Depending on the size of your group you might also want to consider inviting elder family members or work colleagues."
                },
                {
                    question: 'What is a good way to organise a stag do?',
                    answer: 'Organising a stag do can be extremely stressful - left face it, blokes are not the most organised of creatures and getting everyone to plan ahead for something months away and pay up, is many an organisers worst nightmare. With Chillisauce we make it as simple as possible - you simply build an itinerary (we have lots of trained staff to help with that if you need it), put down a small deposit, and then send out a link that we give you to anyone you want to invite. All the invitees, then log in and pay their deposits and thats pretty much it - we will chase everyone up to pay their balances on time, and you get the itinerary, maps and all the other details to make a successful stag do.'
                },
                {
                    question: 'How do you make a stag do special?',
                    answer: "To make your stag do special, it's important to think about the groom and what he would want from the weekend. Consider his interests, hobbies and passions when deciding on activities or locations. You could also add personal touches such as themed costumes or a customised gift for the groom that reflects his personality."
                },
                {
                    question: "What if some people can't afford the stag do?",
                    answer: "If some of your guests are unable to afford the stag do, then you should let them know upfront so that everyone is on the same page. With Chillisauce everyone can pick and choose the activities they are able to attend so everyone is not forced to do everything if they can't afford it. We also make payment very simple, so guest can pay any amount they want when they want, and have some spare cash to put towards the stag weekend."
                },
                {
                    question: "What's the difference between a stag do and a bachelor party?",
                    answer: "None - The English call it a Stag Do (or Stag weekend, Stag Night or Stag Party) American's call it a bachelor party, its generally referred to as a buck's night in the English speaking southern hemisphere."
                },
                {
                    question: 'Should everyone dress up on a stag do?',
                    answer: "Whether or not everyone should dress up on a stag do is entirely personal preference. You could choose to go for themed outfits, fancy-dress costumes or just opt for casual attire. However, it's important to make sure that everyone knows what the dress code is in advance so no-one feels out of place when the day arrives. One thing to be well aware of is that not all establishments take to kindly to stag do's at the best of times, so if everyone is dressed up, you're going to stick out like a sore thumb, and had best be prepared for knock backs by bouncers. With Chillisauce we work with establishments that are well aware of our guests and we'll have you put on the guest-list so you don't have to worry about getting in or not."
                },
                {
                    question: 'Should the father of the groom go on the stag do?',
                    answer: 'Whether or not the father of the groom should go on the stag do is probably down to how the groom feels about it. If the groom is happy with it, and he wants to join in with the fun then you should definitely invite him along!'
                },
                {
                    question: 'What is the average group size for a stag do?',
                    answer: "We've got 20 years of experience and data on stag weekends so know a thing or two about that. We've had groups down to as low as 5 people, and occasionally well over 50, but on average 22 guests are invited to a stag do and 14 actually attend."
                },
                {
                    question: 'How do you choose activities for a stag do?',
                    answer: "When choosing activities for a stag do, it's important to consider everyone's preferences and budgets. You could opt for traditional activities such as paintball or go-karting, or plan something a bit more unique like axe throwing or an escape rooms. If you have a look at our locations you will see all the possible activities available to choose from, but best of all we gather feedback from all our customers after the stag do and ask them to review every activity - so if you want a safe bet go with activities that have lots of good reviews."
                },
                {
                    question: 'Is it better to stay in the UK or go abroad for a stag do?',
                    answer: "Whether it's better to stay in the UK or go abroad for a stag do really depends on the situation and preferences of the group. Staying in the UK is often cheaper and more convenient, but going abroad offers a wider variety of activities and experiences."
                },
                {
                    question: 'What are some tips for keeping costs down on a stag do?',
                    answer: "When it comes to keeping costs down on a stag do, there are a few things you can do. When you get your stag do quotes from Chillisauce, as long as your group size doesn't change significantly the price is fixed as soon as you pay a deposit. One thing to consider is that accommodation often accounts for a significant amount of the cost and the most preferable gets booked out months ahead of time - to avoid disappointment, book early. Similarly, if you are going abroad, the sooner you can get your flights booked, the cheaper they are likely to be."
                },
                {
                    question: "Stag do, stag night, stag party, stag weekend - what's the difference?",
                    answer: "Nothing - they are all used interchangeably, but 'stag do' is the most frequently used term in the UK."
                },
                {
                    question: 'Do girls get invited to stag weekends?',
                    answer: 'It seems so - around 5% of our stag weekends have female attendees.'
                },
                {
                    question: 'Can you have a joint hen party and stag do?',
                    answer: "You've probably heard in the media that having a joint hen party and stag do is becoming increasingly popular. That is possibly slightly true, but then this is coming from an extremely low base. We've got years of data on this and a on this and a 'Sten Do' (or 'Hag Do' as it is also referred to), still only accounts for about 3% of all organised pre-wedding events."
                }
            ]
        };
    }
};
</script>

<style lang="scss">
.frequently-asked-questions {
    & .summary {
        cursor: pointer;
        font-size: 14px;
        font-family: var(--primary-font-family);
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: all 1s ease;
        //  padding: 5px;

        &:hover {
            background-color: $CB-1;
        }
    }
    & .answer {
        font-size: 14px;
    }
}
</style>
