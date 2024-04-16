<template>
  <span v-if="inline">{{ text }}</span>
  <p v-else-if="paragraph">{{ text }}</p>
  <div v-else>{{ text }}</div>
</template>

<script>
export default {
  props: ['min', 'max', 'inline', 'paragraph'],

  computed: {
    // a computed getter
    text: function () {
      let storySentanceArray = this.story.split('. ')
      let totalSentances = storySentanceArray.length
      let sentanceStartNumber = Math.floor(Math.random() * totalSentances)
      let sentanceStart = storySentanceArray.slice(sentanceStartNumber)
      let longSentance = sentanceStart.join('. ')
      let length =
        Math.floor(Math.random() * (this.max - this.min + 1)) + this.min
      let storyArray = longSentance.split(' ')
      let textArray = storyArray.slice(0, length)
      let text = textArray.join(' ')
      return text
    },
  },
  data() {
    return {
      story: `Weymouth originated as a settlement on a constricted site to the south and west of Weymouth Harbour, an outlying part of Wyke Regis. The town developed from the mid 12th century onwards, but was not noted until the 13th century. By 1252 it was established as a seaport and become a chartered borough. Melcombe Regis developed separately on the peninsula to the north of the harbour; it was mentioned as a licensed wool port in 1310.

Melcombe Regis is thought to be the first port at which the Black Death came into England in June 1348, possibly either aboard a spice ship or an army ship. In their early history Weymouth and Melcombe Regis were rivals for trade and industry, but the towns were united in an Act of Parliament in 1571 to form a double borough Both towns have become known as Weymouth, despite Melcombe Regis being the main town centre. The villages of Upwey, Broadwey, Preston, Wyke Regis, Chickerell, Southill, Radipole and Littlemoor have become part of the built-up area.

King Henry VIII had two Forts built to protect the south Dorset coast from invasion in the 1530s: Sandsfoot Castle in Wyke Regis and Portland Castle in Castletown. Parts of Sandsfoot have fallen into the sea due to coastal erosion. During the English Civil War, around 250 people were killed in the local Crabchurch Conspiracy in February 1645. In 1635, on board the ship Charity, around 100 emigrants from the town crossed the Atlantic Ocean and settled in Weymouth, Massachusetts. There are memorials to this on the side of Weymouth Harbour and near Weymouth Pavilion.

The architect Sir Christopher Wren was the Member of Parliament for Weymouth in 1702, and controlled nearby Portland's quarries from 1675 to 1717. When he designed St Paul's Cathedral, Wren had it built out of Portland Stone, the famous stone of Portland's quarries. Sir James Thornhill was born in the White Hart public house in Melcombe Regis and became the town's MP in 1722. Thornhill became an artist, and coincidentally decorated the interior of St Paul's Cathedral.

The resort is among the first modern tourist destinations, after King George III's, brother the Duke of Gloucester built a grand residence there, Gloucester Lodge, and passed the mild winter there in 1780; the king made Weymouth his summer holiday residence on fourteen occasions  Between 1789 and 1805, even venturing into the sea in a bathing machine. A painted statue of the king stands on the seafront. A mounted white horse representing the king is carved into the chalk hills of Osmington. The horse faces away from the town, and a myth developed that the king took offence, believing it was a sign that the townspeople did not welcome him.

Weymouth's esplanade is composed of Georgian terraces, which have been converted into apartments, shops, hotels and guest houses. The buildings were constructed in the Georgian and Regency periods  Between 1770 and 1855, designed by architects such as James Hamilton, and were commissioned by wealthy businessmen. These terraces form a long, continuous arc of buildings which face Weymouth Bay along the esplanade, which also features the multi-coloured Jubilee Clock, erected in 1887 to mark the 50th year of Queen Victoria's reign,  statues of Victoria, George III and Sir Henry Edwards, Member of Parliament for the borough from 1867 to 1885. There are also two war memorials stand along the Esplanade.

Weymouth and Portland were bombed by German planes for their role in World War II; Portland harbour had a large naval base, and Weymouth was home to Nothe Fort. 517,816 troops embarked through the borough to fight at the Battle of Normandy, and the Bouncing bomb was tested in the Fleet lagoon to the west of town. The history of the area is documented at the Timewalk museum in Brewers Quay; the former brewery is a tourist attraction and shopping village on the southern shore of Weymouth Harbour.

In the centre of the town lies Weymouth Harbour; although it was the reason for the town's foundation, the harbour separates the two areas of Melcombe Regis (the main town centre) and Weymouth (the southern harbourside) from each other. Since the 18th century this has been overcome with successive bridges over the W1est part of the harbour. The present Town Bridge, built in 1930, is a lifting bascule bridge, one of ten in the United Kingdom, to let boats access the inner harbour. The Royal National Lifeboat Institution stationed a lifeboat at Weymouth for the first time on 26 January 1869. A boathouse was built with a slipway by the harbour and is still in use, although the lifeboat is now moored at a pontoon.

Portland has been inhabited since at least the Mesolithic period (the Middle Stone Age) - there is archaeological evidence of Mesolithic inhabitants near Portland Bill, and of inhabitation in ages since. The Romans occupied Portland, reputedly calling it Vindelis. In 1539 King Henry VIII ordered the construction of Portland Castle for defence against attacks by the French; the castle cost £4,964. It is one of the best preserved castles from this period, and is open to the public by the custodians English Heritage.

Sir Christopher Wren, the architect and Member of Parliament for nearby Weymouth, used six million tons of white Portland limestone to rebuild destroyed parts of London after the Great Fire of London of 1666. Well-known buildings in the capital, including St Paul's Cathedral and the eastern front of Buckingham Palace feature the stone. After World War I, a quarry was opened by The Crown Estate to provide stone for the Cenotaph in Whitehall and half a million gravestones for war cemeteries, and after World War II hundreds of thousands of gravestones were hewn for the fallen soldiers on the Western Front. Portland cement has nothing to do with Portland; it was named such due to its similar colour to Portland stone when mixed with lime and sand.

There have been railways in Portland since the early 19th century. The Merchant's Railway was the earliest - it opened in 1826 (one year after the Stockton and Darlington railway) and ran from the quarries at the north of Tophill to a pier at Castletown, from where the Portland stone was shipped around the country. The Weymouth and Portland Railway was laid in 1865, and ran from a station in Melcombe Regis, across the Fleet and along the low isthmus behind Chesil Beach to a station at Victoria Square in Chiswell. At the end of the 19th century the line was extended to the top of the island as the Easton and Church Hope Railway, running through Castletown and ascending the cliffs at East Weares, to loop back north to a station in Easton. The line closed to passengers in 1952, and the final goods train (and two passenger 'specials') ran in April 1965.

The Royal National Institution for the Preservation of Life from Shipwreck stationed a lifeboat at Portland in 1826, but it was withdrawn in 1851. Coastal flooding has affected Portland's residents and transport for centuries - the only way off the island is along the causeway in the lee of Chesil Beach. At times of extreme floods (about every 10 years) this road link is cut by floods. The low-lying village of Chiswell used to flood on average every 5 years. Chesil Beach occasionally faces severe storms and massive waves, which have a fetch across the Atlantic Ocean. Following two severe flood events in the 1970s, Weymouth and Portland Borough Council and Wessex Water decided to investigate the structure of the beach, and possible coastal management schemes that could be built to protect Chiswell and the beach road. In the 1980s it was agreed that a scheme to protect against a one-in-five year storm would be practicable; it would reduce flood depth and duration in more severe storms. Hard engineering techniques were employed in the scheme, including a gabion beach crest running 1.6 kilometres (1 mi) to the north of Chiswell, an extended sea wall in Chesil Cove, and a culvert running from inside the beach, underneath the beach road and into Portland Harbour, to divert flood water away from low lying areas.

At the start of World War I, HMS Hood was sunk in the passage  Between the southern breakwaters to protect the harbour from torpedo and submarine attack. Portland Harbour was formed (1848–1905) by the construction of breakwaters, but before that the natural anchorage had hosted ships of the Royal Navy for more than 500 years. It was a centre for Admiralty research into asdic submarine detection and underwater weapons from 1917 to 1998; the shore base HMS Serepta was renamed HMS Osprey in 1927. During World War II Portland was the target of heavy bombing, although most warships had moved North as Portland was within enemy striking range across the Channel. Portland was a major embarkation point for Allied forces on D-Day in 1944. Early helicopters were stationed at Portland in 1946-1948, and in 1959 a shallow tidal flat, The Mere, was infilled, and sports fields taken to form a heliport. The station was formally commissioned as HMS Osprey which then became the largest and busiest military helicopter station in Europe. The base was gradually improved with additional landing areas and one of England's shortest runways, at 229 metres (751 ft). There are still two prisons on Portland, HMP The Verne, which until 1949 was a huge Victorian military fortress, and a Young Offenders' Institution (HMYOI) on the Grove clifftop. This was the original prison built for convicts who quarried stone for the Portland Breakwaters from 1848. For a few years until 2005 Britain's only prison ship, HMP Weare, was berthed in the harbour.

The naval base closed after the end of the Cold War in 1995, and the Royal Naval Air Station closed in 1999, although the runway remained in use for Her Majesty's Coastguard Search and Rescue flights as MRCC Portland. MRCC Portland's area of responsibility extends midway across the English Channel, and from Start Point in Devon to the Dorset/Hampshire border, covering an area of around 10,400 square kilometres (4,000 sq mi). The 12 Search and Rescue teams in the Portland area dealt with almost 1000 incidents in 2005.

Human settlements in Dorset are thought to have started around 12,500 BC when Britain was still attached to Europe. The population grew rapidly during the Neolithic Era as a wave of immigrant farmers headed to Dorset. Romans first landed in Dorset at Poole Harbour before moving inland, taking Abbotsbury Castle and other forts across Dorset. Dorchester has many notable Roman artefacts there today.

Many of today’s settlements were there during the Saxon times according to The Domesday Book. During this time Dorset’s population grew and much more land was dedicated to farming to deal with the increased demand for food. The 18th century brought smuggling to the Dorset coastline with the coves and caves ideal for the smugglers' activities. Dorset was unaffected during the industrial revolution with the largest industry still being agriculture.

Several of the harbours along the Dorset coast were used as launching grounds for the D-Day landings. Bournemouth and Christchurch were part of Hampshire until 1974 when the political boundaries were changed.

Bournemouth is the largest town in Dorset with a population of 187,000 with Poole being the next largest at 154,000. These towns along with Christchurch form the South East Dorset conurbation where over half of the population of Dorset live.

The next largest settlement is Weymouth with 52,000 people living in the seaside town. Dorchester is the county town of Dorset and has nearly 20,000 residents. The majority of the larger towns are in the south of the county but there are a number of charming towns and villages elsewhere in the county including Gillingham, Sherborne and Bridport.

Dorset is one of the few English counties not to have a motorway within its borders but the A303 from London to Devon and Cornwall briefly passes through the county. There are several A roads that branch off the A303 allowing easy access to towns and villages across the county. The A31 is a bypass road allowing people joining the county from the M27 to bypass towns in the south of the county.

London is easily accessible via train with two main lines running through the county. Northern towns such as Gillingham and Sherborne are served by the West of England Main Line which runs from London Waterloo to Exeter St David’s. The South Western Main Line runs through Bournemouth, Poole and Dorchester before terminating at Weymouth.

There is only one passenger airport in the county found in Bournemouth which serves a multitude of European cities and tourist destinations with extra flights put on seasonally. Dorset is also connected to the continent by ferry services from Poole and Weymouth along with ferry services to the Channel Islands.

There are thousands of buildings of historical significance in the county with over 1,500 Scheduled Ancient Monuments and 12,850 listed buildings including Portland Castle and Corfe Castle. Dorset is also famed for its strong literary links with author and poet Thomas Hardy who was born in the county. The Hitchhiker’s Guide to the Galaxy author Douglas Adams also had a home in Stalbridge.

Dorset has only recently adopted a flag which is known as the Dorset Cross or St Wite’s Cross with the final design being decided upon after a public vote. The winning design has a white cross with a red border on a golden background with colours representing the flag of England along with the sandy beaches of Dorset. All three colours also feature on Dorset County Council’s coat of arms.

Many dishes served in Dorset today are simple dishes that are cooked with locally sourced, organic food. There are a number of farmers’ markets, farm shops and food fairs where local food can be found.

The most famous dish to be produced in the county is Dorset Knob which is a hard dry savoury biscuit. There is currently only one producer of the biscuit and it is only available for a limited time of the year. Traditionally eaten with Dorset Blue Vinney cheese, the biscuit is said to have been a favourite of Thomas Hardy. Every May Cattistock hosts a Dorset Knob throwing competition.

The county’s natural beauty lends itself to epic stories with sweep and splendour; it’s also a favourite location because of its fantastic coastline and awe-inspiring ancient landscapes of hills that seem to roll on forever. Empty space on such a huge scale is rare in England and much like the neighbouring Wiltshire, there’s plenty of room to make films with period settings here without traces of the modern age intruding on the frame.

If you love films, you’ll enjoy seeking out famous landscapes, villages and buildings as seen on the silver screen. Dorset is home to many former film locations that can still be recognised, as well as locations that were heavily disguised because they were meant to portray somewhere else faraway.

We’re film fans too and we’ve unearthed virtually everything lensed in Dorset from the biggest blockbusters to notorious horror films, even one set in a Bournemouth takeaway.

Famous author Thomas Hardy penned and set most of his novels in Dorset, and as a result, the film adaptations have also been shot here. His best-known novel, Far from the Madding Crowd, has been adapted twice; once in 1967 by director John Schlesinger and starring Julie Christie; and again in 2015 with direction by Thomas Vinterberg and starring Carey Mulligan. Locations included: Maiden Castle, Mapperton House, West Bay, Eype Beach, Sherbourne and Durdle Door.

Another unofficial update of Far from the Madding Crowd called Tamara Drewe was also filmed in the villages of Salwayash and Yetminster; this version was also based on the eponymous comic-strip by Posy Simmonds. Also seek out Thomas Hardy’s The Scarlet Tunic that was released in 1998 and largely shot in Purbeck. Also filmed at Maiden Castle was the 1921 version of the Mayor of Casterbridge. There was also a ‘made for TV’ version adapted by the visionary, Dennis Potter, that employed the iconic ruins of Corfe Castle as enhancement.  Not all Thomas Hardy Dorset-set stories are made within county borders, but if you are a fan of his seek out: Jude, The Woodlanders, and The Claim (based on the Mayor of Casterbridge).

A full-sized set of Castle Elsinore was built for a 1913 silent movie version of William Shakespeare’s Hamlet at Dungy Head whilst much of the film was shot at Lulworth Cove. Another classic is the unusual Meryl Streep starrer, The French Lieutenant’s Woman. It’s perhaps one of the most enduring images of British cinema, the mere mention of the film still conjures up the vision of the windswept character stood at the end of The Cobb in Lyme Regis. Legend has it, that a male stand-in was used in the final shot as the producers didn’t want to risk their star getting swept away into the sea.  Another literary classic is Tom Jones which was filmed at Cerne Abbas, famous for its ‘happy’ chalk giant cut into the side of a hill. You can visit Cranborne House, another Tom Jones location, and can marvel at what a bonny lad the acting titan Albert Finney once was! Albert Finney was back in Dorset at Milton Abbey School to film the second movie version of Terence Rattigan’s brilliant play The Browning Version (1994) for director Mike Figgis. He delivers one of his best performances in this underrated, mostly forgotten, British movie.

When Jane Austen’s stories were seeing something of a resurgence in the mid-to-late 1990s due to the TV success of Pride & Prejudice, three other adaptations were made.  They were Persuasion (1995) filmed in Lyme Regis, Emma (1996, starring Gwyneth Paltrow), and Mansfield Park (1998, starring Australian actress Frances O’Connor).  For fans of The Dam Busters (aka Dads and Grandads everywhere) head to Chesil Beach to see the actual location where the bouncing bomb trials were carried out, and the film location too. A classic war movie that has stayed in the popular film lexicon for decades, where many others have begun to fade away.

Everyone of a certain age has seen or at least vaguely recalls the excruciatingly funny Mike Leigh film Nuts in May. The tale of two holiday makers bobbing around Purbeck locations tormenting the locals with eco-friendly sing-songs is a comedy classic. Locations include Corfe Castle, Worth Matravers and the military ranges above Swanage. Gay-auteur Derek Jarman headed to Studland Bay for scenes in his 1978 film Jubilee – an impressive movie that caught the zeitgeist of Punk and Thatcherism by reimagining the 1970s. Starring pop-icon Adam Ant, Toyah Wilcox and a cast of famous outcasts, this is another film lost in time. Staying with the New Queer Cinema  classics, the film Wilde which stars Stephen Fry as the eponymous man of wit and words was filmed around Swanage Harbour to great effect. As recently as summer 2018, a major film was shot in Dorset on location, On Chesil Beach, based on the best-selling novel by Ian McEwan. Starring Saoirse Ronan and newcomer Billy Howle, this faithful adaptation was a modest hit and used the location of Chesil Beach to stunning effect.

The phenomenally successful TV serial Broadchurch was made around West Bay, Littlebredy and Bridport at the western end of the Jurassic Coast.  Starring Olivia Colman and David Tennant, it is one of British television’s most-watched dramas and the locations draw in 1000s of fans every year.  Other well-known shows over the decades have used Dorset as the backdrops for scenes in Monty Python’s Flying Circus (Studland), Wolf Hall (Sherborne), forgotten 1960s mini-series The Bulldog Breed (Poole Park) and The Fall and Rise of Reginald Perrin (a famous TV show from the 70s and early 80s) where Leonard Rossiter takes his long bath at Studland Beach.

`,
    }
  },
}
</script>

<style lang="scss"></style>
