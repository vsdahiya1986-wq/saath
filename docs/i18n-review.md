# Assamese translation review

Generated 2026-09-20T08:29:18.884Z by `node scripts/verify-translations.mjs --run`. Do not edit by hand.

- Engine A: Bhashini translation en→as. Engine B: Bhashini translation as→en. IndicTrans2 is the intended engine B but its models are gated; see the script header.
- FAIL = a denylisted concept, or the round trip diverges on **both** meaning (similarity < 0.75) and words (overlap < 0.5).
- A FAIL shows its English on screen and has no Assamese audio. LONG = more than 1.8× the English length (may clip).

**292/295 verified (99%). 3 fall back to English.**

## Needs human review (3)

| key | English | Assamese | round-trip English | similarity | word overlap | verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `activity.saah_pat` | Saah Pat · Tea Leaf | চাহ পাত · চাহ পাত | Tea leaves · Tea leaves | 0.62 | 0.25 | FAIL |
| `exit.pause` | Stop for a moment | অলপ সময় ৰাখক | Hold for a while | 0.54 | 0 | FAIL |
| `q.saah_pat.left` | Tea shoots still to find | চাহৰ বাকলি এতিয়াও বিচাৰি পোৱা বাকী | The tea bag is yet to be found | 0.69 | 0.25 | FAIL |

### Flagged by reading (2)

Flagged by a person reading the screen, not by a native speaker — kept here for review even when the round trip passes.

| key | why | current Assamese | verdict |
| --- | --- | --- | --- |
| `opt.bucket.around_house` | 08 item 6: was "সাজু হৈ গৈ আছে" (reads as "getting ready"); English source changed to "Elsewhere in the house". | ঘৰৰ আন ঠাইত | PASS |
| `q.sort_home.where` | 08 item 6: was "এইটো ক'ত আছে?" ("where is this?") for "where does this belong?"; English source changed to "Where should this go?". | এইটো ক'লৈ যাব লাগে? | PASS |

## Passed but long — check for clipping (9)

| key | English | Assamese | round-trip English | similarity | word overlap | verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `home.help` | Help | সহায় কৰক | Help me | 0.83 | 1 | PASS · LONG |
| `rest.rest_now` | Rest now | এতিয়া বিশ্ৰাম কৰক | Take a rest now | 0.78 | 1 | PASS · LONG |
| `domain.memory` | Memory | স্মৃতিশক্তি | the power of memory | 0.81 | 1 | PASS · LONG |
| `status.synced` | Saved | সংৰক্ষণ কৰা হৈছে | Saved | 1 | 1 | PASS · LONG |
| `help.title` | Help | সহায় কৰক | Help me | 0.83 | 1 | PASS · LONG |
| `remind.done` | Done | সম্পন্ন কৰা হৈছে | Done | 1 | 1 | PASS · LONG |
| `reminder.none` | No reminders set yet | এতিয়ালৈকে কোনো ৰিমাইণ্ডাৰ কৰা হোৱা নাই | No reminders yet | 0.88 | 0.75 | PASS · LONG |
| `reminder.now` | Now | এতিয়া | NOW | 1 | 1 | PASS · LONG |
| `mood.good` | Good | ভাল হৈছে | It's good | 0.67 | 1 | PASS · LONG |

## Every key

| key | English | Assamese | round-trip English | similarity | word overlap | verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `home_intro` | This is your memory companion. Choose Play, Help, or Today. | এয়া আপোনাৰ স্মৃতিৰ সংগী। প্লে, হেল্প, বা টুডে বাছনি কৰক। | This is your memory partner. Select Play, Help, or Today. | 0.85 | 0.67 | PASS |
| `home.play` | Play | খেলিব | let's play | 0.66 | 1 | PASS |
| `home.help` | Help | সহায় কৰক | Help me | 0.83 | 1 | PASS · LONG |
| `home.today` | Today | আজি | today's | 0.81 | 1 | PASS |
| `home.circle` | Circle | বৃত্ত | circle | 1 | 1 | PASS |
| `home.help.ok` | No help is needed now | এতিয়া কোনো সহায়ৰ প্ৰয়োজন নাই | Don't need any help now | 0.8 | 0.5 | PASS |
| `activity.familiar_pairs` | Today & Me | আজি আৰু মই | me and today | 0.91 | 1 | PASS |
| `activity.sound_sight` | Hear & Find | শুনক আৰু বিচাৰক | Listen and find out | 0.64 | 0.5 | PASS |
| `activity.pattern_garden` | Sort the Home | ঘৰটো ছ'ৰ্ট কৰক | Sort the house | 0.94 | 0.5 | PASS |
| `activity.my_next_step` | My Next Step | মোৰ পৰৱৰ্তী পদক্ষেপ | My next step | 1 | 1 | PASS |
| `activity.together` | Together Moment | একেলগে মুহূৰ্ত | A moment together | 0.85 | 1 | PASS |
| `activity.saah_pat` | Saah Pat · Tea Leaf | চাহ পাত · চাহ পাত | Tea leaves · Tea leaves | 0.62 | 0.25 | FAIL |
| `activity.apon_mukh` | Apon Mukh · Dear Faces | অপোন মুখ · মৰমৰ মুখবোৰ | Your Face Dear Faces | 0.49 | 0.5 | PASS |
| `play.today_three` | Three for today | আজিৰ বাবে তিনিটা | three for today | 1 | 1 | PASS |
| `play.all_activities` | All activities | সকলো কাৰ্য্যকলাপ | All activities | 1 | 1 | PASS |
| `display.text_size` | Text size | লিখনীৰ আকাৰ | Text size | 1 | 1 | PASS |
| `rest.title` | Do you want to rest now? | আপুনি এতিয়া বিশ্ৰাম কৰিব বিচাৰে নেকি? | Do you want to rest now? | 1 | 1 | PASS |
| `rest.rest_now` | Rest now | এতিয়া বিশ্ৰাম কৰক | Take a rest now | 0.78 | 1 | PASS · LONG |
| `rest.one_more` | Play one more | আন এটা বজোৱা | play another one | 0.85 | 0.67 | PASS |
| `domain.memory` | Memory | স্মৃতিশক্তি | the power of memory | 0.81 | 1 | PASS · LONG |
| `domain.attention` | Attention & Concentration | মনোযোগ আৰু মনোযোগ | Attention and focus | 0.82 | 0.5 | PASS |
| `domain.routine` | Daily Routine Recall | দৈনিক ৰুটিন ৰিকল | Daily routine recall | 1 | 1 | PASS |
| `domain.pattern` | Pattern & Object Recognition | আৰ্হি আৰু বস্তু চিনাক্তকৰণ | Pattern and object recognition | 0.96 | 1 | PASS |
| `domain.emotion` | Emotional Engagement | আবেগিক সম্পৰ্ক | Emotional connection | 0.66 | 0.5 | PASS |
| `status.offline` | No internet connection | ইণ্টাৰনেট সংযোগ নাই | There is no Internet connection | 0.91 | 1 | PASS |
| `status.synced` | Saved | সংৰক্ষণ কৰা হৈছে | Saved | 1 | 1 | PASS · LONG |
| `status.no_signal` | Test: no internet | পৰীক্ষাঃ ইণ্টাৰনেট নাই | Test: No Internet | 1 | 1 | PASS |
| `adaptive.same` | The same as last time | যোৱা বাৰৰ দৰে একেই | Same as last time | 0.92 | 1 | PASS |
| `adaptive.easier` | A little easier today | আজি অলপ সহজ হ'ল | It's a little easier today | 0.92 | 1 | PASS |
| `adaptive.harder` | A little harder today | আজি অলপ কঠিন | It's a little hard today | 0.84 | 0.67 | PASS |
| `adaptive.with_help` | With some help today | আজি কিছু সহায়ৰ সৈতে | With some help today | 1 | 1 | PASS |
| `play.title` | Choose an activity | এটা কাৰ্য্যকলাপ বাছনি কৰক | Select an activity | 0.84 | 0.5 | PASS |
| `play.pairs.intro` | Let us talk about today. Choose the answer you think is correct. There is no hurry. | আজিৰ বিষয়ে কথা পাতিম। আপুনি সঠিক বুলি ভবা উত্তৰটো বাছনি কৰক। কোনো ধৰণৰ দৌৰাদৌৰি নাই। | Let's talk about today. Choose the answer that you think is correct. There is no rush. | 0.85 | 0.89 | PASS |
| `play.sound.intro` | Listen to the word, then tap the matching picture. | শব্দটো শুনক, তাৰ পিছত মিল খোৱা ছবিখন টিপক। | Listen to the sound, then tap the matching image. | 0.83 | 0.67 | PASS |
| `play.pattern.intro` | Tap the basket where this belongs. | এইটো য'ত আছে সেই বাকচত টেপ কৰক। | Tap the box where it is located. | 0.5 | 0.5 | PASS |
| `play.step.intro` | Put the steps of your routine in order. | আপোনাৰ ৰুটিনৰ পদক্ষেপবোৰ ক্ৰমত ৰাখক। | Keep the steps of your routine in order. | 0.92 | 0.75 | PASS |
| `play.together.intro` | Let us look at this picture together. | এই ছবিখন একেলগে চাওক। | Look at this picture together. | 0.77 | 1 | PASS |
| `play.saah_pat.intro` | Find the tea shoots with two leaves and one bud. Tap each one you see. There is no hurry. | দুটা পাত আৰু এটা কুঁহি থকা চাহৰ ডালবোৰ বিচাৰি উলিয়াওক। আপুনি দেখা প্ৰতিটো টেপ কৰক। কোনো ধৰণৰ দৌৰাদৌৰি নাই। | Look for tea stalks with two leaves and a bud. Tap each one you see. There is no rush. | 0.86 | 0.77 | PASS |
| `play.apon_mukh.intro` | Tap two cards to see the pictures. Find the two that match. | ছবিবোৰ চাবলৈ দুটা কাৰ্ড টেপ কৰক। মিল খোৱা দুয়োজনক বিচাৰি উলিয়াওক। | Tap two cards to view the images. Find two that match. | 0.95 | 0.71 | PASS |
| `game.not_this_one` | Not this one. | এইটো নহয়। | This is not. | 0.45 | 0.5 | PASS |
| `cue.highlight` | Look here. | ইয়াত চাওক। | Take a look here. | 0.66 | 1 | PASS |
| `cue.reduce` | Let us try with fewer choices. | আমি কম বিকল্পৰ সৈতে চেষ্টা কৰো। | We try with fewer options. | 0.83 | 0.75 | PASS |
| `common.pause` | Paused. Tap to continue, or choose Stop. | থমকি ৰয়। অব্যাহত ৰাখিবলৈ টেপ কৰক, বা ষ্টপ বাছনি কৰক। | Stop. Tap to continue, or select Stop. | 0.89 | 0.6 | PASS |
| `common.open` | Open | খোলক | Open | 1 | 1 | PASS |
| `common.back` | Go back | উভতি যাওক | Go back | 1 | 1 | PASS |
| `common.home` | Home | ঘৰ | Home | 1 | 1 | PASS |
| `common.continue` | Continue | অব্যাহত ৰাখক | Continue | 1 | 1 | PASS |
| `a11y.listen` | Listen | শুনক | Listen | 1 | 1 | PASS |
| `help.title` | Help | সহায় কৰক | Help me | 0.83 | 1 | PASS · LONG |
| `help.need` | I need someone | মোক কোনোবা এজন লাগে | i need someone | 1 | 1 | PASS |
| `help.sent_local` | Your family has been told. | আপোনাৰ পৰিয়ালক জনোৱা হৈছে। | Your family has been notified. | 0.75 | 0.75 | PASS |
| `help.stored` | Saved on this device. It will be sent when there is a connection. | এই ডিভাইচত সংৰক্ষণ কৰা হৈছে। সংযোগ থাকিলে ইয়াক প্ৰেৰণ কৰা হ'ব। | Saved to this device. It will be sent if there is a connection. | 0.95 | 0.8 | PASS |
| `help.stale_warning` | This photo may show an old place. | এই ফটোখনে এটা পুৰণি ঠাই দেখুৱাব পাৰে। | This photo may show an old place. | 1 | 1 | PASS |
| `today.title` | Today's reminders | আজিৰ স্মাৰকসমূহ | Today's Memorials | 0.44 | 0.67 | PASS |
| `remind.medicine` | It is time for your medicine. | এতিয়া আপোনাৰ ঔষধৰ সময়। | Now is the time for your medicine. | 0.88 | 1 | PASS |
| `remind.hydration` | It is time for a glass of water. | এতিয়া এক গিলাচ পানী খোৱাৰ সময়। | Now it's time to drink a glass of water. | 0.83 | 1 | PASS |
| `remind.activity` | It is time for your daily activity. | এইটো আপোনাৰ দৈনন্দিন কাম-কাজৰ সময়। | This is the time for your daily activities. | 0.89 | 0.67 | PASS |
| `remind.appointment` | You have a clinic appointment. | আপোনাৰ এটা ক্লিনিক এপইণ্টমেণ্ট আছে। | You have a clinic appointment. | 1 | 1 | PASS |
| `remind.done` | Done | সম্পন্ন কৰা হৈছে | Done | 1 | 1 | PASS · LONG |
| `remind.not_now` | Not now | এতিয়া নহয় | Not now | 1 | 1 | PASS |
| `exit.pause` | Stop for a moment | অলপ সময় ৰাখক | Hold for a while | 0.54 | 0 | FAIL |
| `exit.skip_one` | Skip this step | এই পদক্ষেপটো বাদ দিয়ক | Skip this step | 1 | 1 | PASS |
| `exit.end` | Finish | সমাপ্ত কৰক | Finish | 1 | 1 | PASS |
| `game.well_done` | Well done. That was good. | ভাল হৈছে। সেইটো ভাল আছিল। | It's good That was good. | 0.55 | 0.5 | PASS |
| `game.gentle_end` | That is fine. We can try again another day. | সেইটো ঠিকেই আছে। আমি আন এটা দিনত পুনৰ চেষ্টা কৰিব পাৰোঁ। | That's alright. We can try again another day. | 0.95 | 0.83 | PASS |
| `game.look_again` | Let us look again. | পুনৰ এবাৰ চাওক। | Take a look again. | 0.57 | 1 | PASS |
| `game.good` | Yes, that is right. | হয়, ঠিকেই কৈছো। | Yes, you're right. | 0.74 | 1 | PASS |
| `q.today_me.part_of_day` | What part of the day is it now? | এতিয়া দিনটোৰ কোনটো অংশ? | What part of the day is it now? | 1 | 1 | PASS |
| `q.today_me.season` | Which season is it now? | এতিয়া কোনটো ঋতু? | What season is it now? | 0.95 | 0.67 | PASS |
| `q.today_me.weekday` | What day of the week is it today? | আজি সপ্তাহটোৰ কোনটো দিন? | What day of the week is today? | 0.97 | 1 | PASS |
| `q.today_me.month` | Which month is it now? | এতিয়া কোন মাহ? | What month is it now? | 0.97 | 0.67 | PASS |
| `opt.period.morning` | Morning | ৰাতিপুৱা | in the morning | 0.76 | 1 | PASS |
| `opt.period.afternoon` | Afternoon | দুপৰীয়া | afternoon | 1 | 1 | PASS |
| `opt.period.evening` | Evening | সন্ধিয়া | in the evening | 0.82 | 1 | PASS |
| `opt.period.night` | Night | ৰাতি | night | 1 | 1 | PASS |
| `opt.season.spring` | Spring | বসন্তকাল | Spring time | 0.88 | 1 | PASS |
| `opt.season.summer` | Summer | গ্ৰীষ্ম | Summer | 1 | 1 | PASS |
| `opt.season.monsoon` | Rainy season | বৰষুণৰ ঋতু | the rainy season | 0.94 | 1 | PASS |
| `opt.season.autumn` | Autumn | শৰৎ কাল | Autumn | 1 | 1 | PASS |
| `opt.season.winter` | Winter | শীতকাল | Winter | 1 | 1 | PASS |
| `opt.weekday.sunday` | Sunday | দেওবাৰ | sunday | 1 | 1 | PASS |
| `opt.weekday.monday` | Monday | সোমবাৰ | monday | 1 | 1 | PASS |
| `opt.weekday.tuesday` | Tuesday | মঙলবাৰে | on Tuesday | 0.81 | 1 | PASS |
| `opt.weekday.wednesday` | Wednesday | বুধবাৰে | on Wednesday | 0.81 | 1 | PASS |
| `opt.weekday.thursday` | Thursday | বৃহস্পতিবাৰ | thursday | 1 | 1 | PASS |
| `opt.weekday.friday` | Friday | শুক্ৰবাৰে | on friday | 0.81 | 1 | PASS |
| `opt.weekday.saturday` | Saturday | শনিবাৰ | saturday | 1 | 1 | PASS |
| `opt.month.january` | January | জানুৱাৰী | January | 1 | 1 | PASS |
| `opt.month.february` | February | ফেব্ৰুৱাৰী | February | 1 | 1 | PASS |
| `opt.month.march` | March | মাৰ্চ | March | 1 | 1 | PASS |
| `opt.month.april` | April | এপ্ৰিল | April | 1 | 1 | PASS |
| `opt.month.may` | May | মে | May | 1 | 1 | PASS |
| `opt.month.june` | June | জুন | June | 1 | 1 | PASS |
| `opt.month.july` | July | জুলাই | July | 1 | 1 | PASS |
| `opt.month.august` | August | আগষ্ট | August | 1 | 1 | PASS |
| `opt.month.september` | September | ছেপ্টেম্বৰ | September | 1 | 1 | PASS |
| `opt.month.october` | October | অক্টোবৰ | the october | 0.89 | 1 | PASS |
| `opt.month.november` | November | নৱেম্বৰ | November | 1 | 1 | PASS |
| `opt.month.december` | December | ডিচেম্বৰ | December | 1 | 1 | PASS |
| `done.today` | Today | আজি | today's | 0.81 | 1 | PASS |
| `done.date` | Date | তাৰিখ | Date | 1 | 1 | PASS |
| `done.season` | Season | ঋতু | season | 1 | 1 | PASS |
| `done.time_of_day` | Time of day | দিনটোৰ সময় | Time of the day | 0.96 | 1 | PASS |
| `opt.bucket.kitchen` | Kitchen | পাকঘৰ | Kitchen | 1 | 1 | PASS |
| `opt.bucket.getting_ready` | Getting ready | সাজু হৈ গৈ আছে | Getting ready | 1 | 1 | PASS |
| `opt.bucket.around_house` | Elsewhere in the house | ঘৰৰ আন ঠাইত | In another part of the house | 0.79 | 0.5 | PASS |
| `item.reg_tumbler` | Steel tumbler | ষ্টীলৰ টাম্বলাৰ | steel tumbler | 1 | 1 | PASS |
| `item.reg_kettle` | Tea kettle | চাহৰ কেটলি | tea kettle | 1 | 1 | PASS |
| `item.reg_thali` | Thali plate | থালী প্লেট | Thali plate | 1 | 1 | PASS |
| `item.reg_ghoti` | Water pot | পানীৰ পাত্ৰ | water container | 0.65 | 0.5 | PASS |
| `item.reg_comb` | Comb | কম্ব | comb | 1 | 1 | PASS |
| `item.reg_mirror` | Hand mirror | হাতৰ আইনা | hand mirror | 1 | 1 | PASS |
| `item.reg_slipper` | Slippers | চপ্পলবোৰ | slippers | 1 | 1 | PASS |
| `item.reg_jhola` | Cloth bag | কাপোৰৰ বেগ | cloth bag | 1 | 1 | PASS |
| `item.reg_umbrella` | Japi hat | জাপী টুপি | Japi hat | 1 | 1 | PASS |
| `item.reg_broom` | Broom | ঝাড়ু | broom | 1 | 1 | PASS |
| `item.reg_torch` | Torch | টৰ্চ | Torch | 1 | 1 | PASS |
| `item.reg_keylock` | Lock and key | লক আৰু চাবি | The lock and key | 0.93 | 1 | PASS |
| `item.reg_lamp` | Diya lamp | দিয়া লেম্প | diya lamp | 1 | 1 | PASS |
| `item.reg_stool` | Mora stool | মোৰা ষ্টুল | Mora Stool | 1 | 1 | PASS |
| `item.reg_pankha` | Hand fan | হাতৰ ফেন | hand fan | 1 | 1 | PASS |
| `item.reg_basket` | Bamboo basket | বাঁহৰ বাকচ | Bamboo box | 0.68 | 0.5 | PASS |
| `item.reg_dhekia` | Dhekia greens | ঢেকিয়া সেউজীয়া | Dhekia green | 0.9 | 0.5 | PASS |
| `item.reg_claypot` | Earthen water pot | মাটিৰ পানীৰ পাত্ৰ | earthen water tank | 0.78 | 0.67 | PASS |
| `item.reg_areca` | Areca nut plate | এৰিকা বাদামৰ প্লেট | A plate of areca nut | 0.94 | 1 | PASS |
| `item.reg_ricepot` | Rice pot | চাউলৰ পাত্ৰ | rice bowl | 0.7 | 0.5 | PASS |
| `item.reg_gamosa` | Gamosa | গমোছা | gamosa | 1 | 1 | PASS |
| `item.reg_xorai` | Brass offering tray | ব্ৰাছ অফাৰিং ট্ৰে | Brush Offering Tray | 0.51 | 0.67 | PASS |
| `item.reg_net` | Fishing net | মাছ ধৰা জাল | fishing net | 1 | 1 | PASS |
| `item.reg_loom` | Weaving loom | তাঁত বয়ন | handloom weaving | 0.75 | 0.5 | PASS |
| `routine.reg_morning_routine` | Morning routine | ৰাতিপুৱাৰ ৰুটিন | Morning routine | 1 | 1 | PASS |
| `step.reg_morning_routine.wake` | Wake up | জাগি উঠা | wake up | 1 | 1 | PASS |
| `step.reg_morning_routine.medicine` | Take medicine | ঔষধ খাওক | Take your medicine | 0.91 | 1 | PASS |
| `step.reg_morning_routine.wash` | Wash your face | আপোনাৰ মুখখন ধুই লওক | Wash your face | 1 | 1 | PASS |
| `step.reg_morning_routine.breakfast` | Have breakfast | ৰাতিপুৱাৰ আহাৰ খাওক | Eat breakfast | 0.9 | 0.5 | PASS |
| `routine.reg_afternoon_routine` | Afternoon routine | দুপৰীয়াৰ ৰুটিন | Afternoon routine | 1 | 1 | PASS |
| `step.reg_afternoon_routine.rest` | Sit and rest | বহি বিশ্ৰাম কৰক | Take a rest outside | 0.63 | 0.5 | PASS |
| `step.reg_afternoon_routine.tea` | Have tea | চাহ খাওক | have tea | 1 | 1 | PASS |
| `step.reg_afternoon_routine.walk` | Short walk | চুটি খোজকঢ়া | short walk | 1 | 1 | PASS |
| `step.reg_afternoon_routine.water` | Drink water | পানী খাওক | Drink water | 1 | 1 | PASS |
| `routine.reg_evening_routine` | Evening routine | সন্ধিয়াৰ ৰুটিন | Evening routine | 1 | 1 | PASS |
| `step.reg_evening_routine.wash_up` | Wash your hands | হাত ধোৱা | wash your hands | 1 | 1 | PASS |
| `step.reg_evening_routine.dinner` | Have dinner | ৰাতিৰ আহাৰ খাওক | Eat dinner | 0.85 | 0.5 | PASS |
| `step.reg_evening_routine.lock_up` | Lock the door | দুৱাৰখন বন্ধ কৰা | close the door | 0.73 | 0.5 | PASS |
| `step.reg_evening_routine.sleep` | Turn off the lamp | লেম্পটো বন্ধ কৰি দিয়ক | turn off the lamp | 1 | 1 | PASS |
| `routine.reg_prayer_routine` | Evening prayer | সন্ধিয়াৰ প্ৰাৰ্থনা | Evening Prayer | 1 | 1 | PASS |
| `step.reg_prayer_routine.light` | Light the lamp | লেম্পটো জ্বলাই দিয়া | light the lamp | 1 | 1 | PASS |
| `step.reg_prayer_routine.sit` | Sit on the mat | চটাত বহি থাকক | Stay out on the mat | 0.82 | 0.5 | PASS |
| `step.reg_prayer_routine.pray` | Say the prayer | প্ৰাৰ্থনা কওক | Say a prayer | 0.91 | 1 | PASS |
| `step.reg_prayer_routine.put_out` | Put out the lamp | লেম্পটো জ্বলাই দিয়ক | turn on the lamp | 0.8 | 0.33 | PASS |
| `routine.reg_bath_routine` | Bath time | গা ধোৱাৰ সময় | Washing time | 0.63 | 0.5 | PASS |
| `step.reg_bath_routine.fetch` | Fetch water | পানী কঢ়িয়াই আনক | Bring water | 0.61 | 0.5 | PASS |
| `step.reg_bath_routine.wash` | Soap and wash | চাবোন আৰু ধুই পেলাওক | Soap and wash | 1 | 1 | PASS |
| `step.reg_bath_routine.dry` | Dry with the gamosa | গেমোছাৰে শুকোৱা | dry with a gamosa | 0.98 | 1 | PASS |
| `step.reg_bath_routine.dress` | Change clothes | কাপোৰ সলনি কৰক | Change your clothes | 0.96 | 1 | PASS |
| `together.childhood.theme` | Childhood | শৈশৱ | Childhood | 1 | 1 | PASS |
| `together.childhood.q` | Tell me about the house where you lived as a child. | আপুনি শৈশৱত বাস কৰা ঘৰটোৰ বিষয়ে মোক কওক। | Tell me about the house you lived in as a child. | 0.97 | 0.88 | PASS |
| `together.childhood.follow` | Who lived there with you? | আপোনাৰ লগত তাত কোনে বাস কৰিছিল? | Who lived there with you? | 1 | 1 | PASS |
| `together.food.theme` | Food | খাদ্য | food | 1 | 1 | PASS |
| `together.food.q` | What was your favourite food as a child? | শৈশৱত আপোনাৰ প্ৰিয় খাদ্য কি আছিল? | What was your favorite food as a child? | 0.97 | 0.83 | PASS |
| `together.food.follow` | Who used to cook it for you? | আপোনাৰ বাবে কোনে ৰন্ধা-বঢ়া কৰিছিল? | Who cooked for you? | 0.81 | 0.33 | PASS |
| `together.festivals.theme` | Festivals | উৎসৱবোৰ | Festivals | 1 | 1 | PASS |
| `together.festivals.q` | How did your family celebrate Bihu or a festival you love? | আপোনাৰ পৰিয়ালে কেনেকৈ বিহু বা আপোনাৰ প্ৰিয় উৎসৱ উদযাপন কৰিছিল? | How did your family celebrate Bihu or your favourite festival? | 0.98 | 0.86 | PASS |
| `together.festivals.follow` | What did you wear on that day? | সেইদিনা আপুনি কি পিন্ধিছিল? | What did you wear that day? | 0.97 | 1 | PASS |
| `together.music.theme` | Music | সংগীত | Music | 1 | 1 | PASS |
| `together.music.q` | Which song do you remember singing when you were young? | সৰু হৈ থাকোতে আপুনি কোনটো গীত গাইছিল মনত আছে? | Do you remember what song you used to sing when you were a kid? | 0.9 | 0.57 | PASS |
| `together.music.follow` | Can you sing a little of it? | আপুনি ইয়াৰ পৰা অলপ গান গাব পাৰিবনে? | Can you sing a few songs from it? | 0.78 | 0.67 | PASS |
| `together.work.theme` | Work with your hands | আপোনাৰ হাতেৰে কাম কৰক | Work with your hands | 1 | 1 | PASS |
| `together.work.q` | What work did you enjoy doing with your hands? | আপুনি আপোনাৰ হাতেৰে কৰা কি কাম উপভোগ কৰিছিল? | What did you enjoy doing with your hands? | 0.91 | 0.86 | PASS |
| `together.work.follow` | Who taught you how to do it? | আপোনাক এইটো কেনেকৈ কৰিব লাগে কোনে শিকাইছিল? | Who taught you how to do this? | 0.95 | 1 | PASS |
| `together.places.theme` | Places | স্থানসমূহ | Places | 1 | 1 | PASS |
| `together.places.q` | Where is a place that made you feel happy? | আপোনাক সুখী কৰি তোলা ঠাই ক'ত আছে? | Where are the places that make you happy? | 0.88 | 0.4 | PASS |
| `together.places.follow` | What could you see and hear there? | আপুনি তাত কি দেখিছিল আৰু শুনিছিল? | What did you see and hear there? | 0.83 | 0.75 | PASS |
| `together.tea_time.theme` | Tea time | চাহৰ সময় | tea time | 1 | 1 | PASS |
| `together.tea_time.q` | Do you like your tea with milk or without milk? | আপুনি গাখীৰৰ সৈতে চাহ ভাল পায় নে গাখীৰ অবিহনে? | Do you like tea with milk or without milk? | 0.98 | 1 | PASS |
| `together.tea_time.follow` | Who do you enjoy having tea with? | আপুনি কাৰ লগত চাহ খাবলৈ ভাল পায়? | With whom do you like to have tea? | 0.93 | 0.4 | PASS |
| `together.friends.theme` | Friends | বন্ধুসকল | Friends | 1 | 1 | PASS |
| `together.friends.q` | Tell me about a good friend from when you were young. | মোক তোমাৰ সৰুৰে পৰা এজন ভাল বন্ধুৰ বিষয়ে কোৱা। | Tell me about a good friend of yours from childhood. | 0.87 | 0.67 | PASS |
| `together.friends.follow` | What did you do together? | তুমি একেলগে কি কৰিলা? | What did you do together? | 1 | 1 | PASS |
| `q.sort_home.where` | Where should this go? | এইটো ক'লৈ যাব লাগে? | Where is this supposed to go? | 0.8 | 0.67 | PASS |
| `q.hear_find.listen` | Listen, then find | শুনক, তাৰপিছত বিচাৰি উলিয়াওক | Listen, then find out | 0.8 | 1 | PASS |
| `q.hear_find.look` | Find this picture | এই ছবিখন বিচাৰি উলিয়াওক | Find this image | 0.8 | 0.5 | PASS |
| `q.next_step.first` | What do you do first? | আপুনি প্ৰথমে কি কৰে? | What do you do first? | 1 | 1 | PASS |
| `q.next_step.after` | What do you do next? | পৰৱৰ্তী সময়ত আপুনি কি কৰিব? | What are you going to do next time? | 0.69 | 1 | PASS |
| `q.apon_mukh.find_pairs` | Find the two cards that match | মিল খোৱা দুটা কাৰ্ড বিচাৰি উলিয়াওক | Find two matching cards | 0.92 | 0.75 | PASS |
| `q.saah_pat.find_sprigs` | Find every tea shoot like this one | এনেধৰণৰ প্ৰতিটো চাহৰ শ্বুট বিচাৰি উলিয়াওক | Find each such tea shoot | 0.9 | 0.5 | PASS |
| `q.saah_pat.left` | Tea shoots still to find | চাহৰ বাকলি এতিয়াও বিচাৰি পোৱা বাকী | The tea bag is yet to be found | 0.69 | 0.25 | FAIL |
| `q.saah_pat.all_found` | All found | সকলো পোৱা গৈছে | Everything found | 0.71 | 0.5 | PASS |
| `notice.some_family` | Some of these are your family's own photos. | ইয়াৰে কিছুমান আপোনাৰ পৰিয়ালৰ নিজৰ ফটো। | Some of these are pictures of your family. | 0.91 | 0.5 | PASS |
| `notice.visual_mode` | Read the word, then find its picture. | শব্দটো পঢ়ক, তাৰ পিছত ইয়াৰ ছবি বিচাৰি উলিয়াওক। | Read the word, then find a picture of it. | 0.93 | 0.83 | PASS |
| `notice.family_routine` | Your family's own routine | আপোনাৰ পৰিয়ালৰ নিজৰ ৰুটিন | Your family's own routine | 1 | 1 | PASS |
| `notice.routine_generic` | A family can add their own routine in the Memory Garden. | এটা পৰিয়ালে মেম'ৰী গাৰ্ডেনত তেওঁলোকৰ নিজৰ ৰুটিন যোগ দিব পাৰে। | A family can add their own routine to the Memory Garden. | 0.99 | 1 | PASS |
| `notice.family_photos` | These are your family's own pictures. | এইবোৰ আপোনাৰ পৰিয়ালৰ নিজৰ ফটো। | These are your family's own photos. | 0.98 | 0.8 | PASS |
| `notice.add_photos` | A family can add their own photos in the Memory Garden. | এটা পৰিয়ালে মেম'ৰী গাৰ্ডেনত তেওঁলোকৰ নিজৰ ফটো যোগ দিব পাৰে। | A family can add their own photos to the Memory Garden. | 0.99 | 1 | PASS |
| `game.here_all` | Here are all the pairs. | ইয়াত সকলো যুটি আছে। | Here are all the pairs. | 1 | 1 | PASS |
| `game.here_others` | Here are the others. | ইয়াত বাকীবোৰ আছে। | Here are the rest. | 0.84 | 0 | PASS |
| `game.play_again` | Play again | পুনৰ খেলক | Play Again | 1 | 1 | PASS |
| `game.more_activities` | More activities | অধিক কাৰ্য্যকলাপ | More activities | 1 | 1 | PASS |
| `next.same` | Next time it will be the same. | পৰৱৰ্তী সময়ত একেই হ'ব। | It will be the same next time. | 0.87 | 1 | PASS |
| `next.more` | Next time it will be a little harder. | পৰৱৰ্তী সময়ত ই অলপ কঠিন হ'ব। | Next time it will be a little harder. | 1 | 1 | PASS |
| `next.gentler` | Next time it will be a little easier. | পৰৱৰ্তী সময়ত এয়া অলপ সহজ হ'ব। | This will be a little easier in the future. | 0.71 | 0.5 | PASS |
| `next.with_help` | Next time there will be some help. | পৰৱৰ্তী সময়ত কিছু সহায় হ'ব। | There will be some help in the future. | 0.65 | 0.5 | PASS |
| `together.who` | Who is here? What do you remember about this? | ইয়াত কে আছে? এই বিষয়ে আপোনাৰ কি মনত আছে? | Who's here? What do you remember about this? | 0.95 | 1 | PASS |
| `together.thanks` | Thank you for sharing. | শ্বেয়াৰ কৰাৰ বাবে ধন্যবাদ। | Anyway, thanks for sharing. | 0.73 | 0.5 | PASS |
| `together.done_note` | Talking about memories is good for the mind and the heart. There is no score here. | স্মৃতিৰ বিষয়ে কথা কোৱাটো মন আৰু হৃদয়ৰ বাবে ভাল। ইয়াত কোনো নম্বৰ নাই। | Talking about memories is good for the mind and heart. There is no number. | 0.81 | 0.88 | PASS |
| `together.done` | Finish talking | কথা কোৱা শেষ কৰক | Finish speaking | 0.85 | 0.5 | PASS |
| `together.tell_more` | Tell me more | মোক আৰু কওক | tell me more | 1 | 1 | PASS |
| `together.another` | Another topic | আন এটা বিষয় | It's another matter | 0.38 | 0.5 | PASS |
| `together.reject` | I don't want to see this again | মই এইটো পুনৰ চাবলৈ নিবিচাৰোঁ | I don't want to see this again | 1 | 1 | PASS |
| `together.reject_confirm` | Tap again to remove this forever | ইয়াক চিৰকালৰ বাবে আঁতৰাবলৈ পুনৰ টিপি দিয়ক | Press again to remove it forever | 0.79 | 0.75 | PASS |
| `together.add_photos` | A family member can add real photos and voice notes in the Memory Garden. | পৰিয়ালৰ এজন সদস্যই মেম'ৰী গাৰ্ডেনত প্ৰকৃত ফটো আৰু ভইচ নোট যোগ দিব পাৰে। | A family member can add actual photos and voice notes to the Memory Garden. | 0.98 | 0.9 | PASS |
| `play.subtitle` | Short, easy games. There are no wrong answers. | চুটি, সহজ খেল। কোনো ভুল উত্তৰ নাই। | Short, easy game. There is no wrong answer. | 0.84 | 0.67 | PASS |
| `reminder.overdue` | Past the time | সময় পাৰ হৈ গৈছে | Time is running out | 0.24 | 0.5 | PASS |
| `reminder.next_up` | Coming next | পৰৱৰ্তী আহি আছে | The next one is coming | 0.78 | 1 | PASS |
| `reminder.none` | No reminders set yet | এতিয়ালৈকে কোনো ৰিমাইণ্ডাৰ কৰা হোৱা নাই | No reminders yet | 0.88 | 0.75 | PASS · LONG |
| `reminder.none_help` | A family member or health worker can add medicine, water, activity and clinic reminders in Circle. | পৰিয়ালৰ এজন সদস্য বা স্বাস্থ্য কৰ্মচাৰীয়ে চক্ৰত ঔষধ, পানী, কাৰ্য্যকলাপ আৰু ক্লিনিক ৰিমাইণ্ডাৰ যোগ দিব পাৰে। | A family member or health worker can add medicine, water, activities, and clinic reminders to the cycle. | 0.83 | 0.83 | PASS |
| `reminder.not_armed` | Reminders are not set up on this phone. | এই ফোনত ৰিমাইণ্ডাৰ আপ কৰা নাই। | This phone does not have a reminder up. | 0.81 | 0.6 | PASS |
| `reminder.now` | Now | এতিয়া | NOW | 1 | 1 | PASS · LONG |
| `reminder.snoozed` | Again in 10 minutes | 10 মিনিটৰ ভিতৰত পুনৰ | Back again in 10 minutes | 0.8 | 1 | PASS |
| `reminder.done_state` | Done for today | আজিৰ বাবে কৰা হৈছে | done for today | 1 | 1 | PASS |
| `reminder.more_later` | more reminders later today | আজি পিছত অধিক ৰিমাইণ্ডাৰ | more reminders later today | 1 | 1 | PASS |
| `reminder.all_done` | All reminders are done for today. | আজিৰ বাবে সকলো ৰিমাইণ্ডাৰ কৰা হৈছে। | All reminders have been made for today. | 0.92 | 0.75 | PASS |
| `today.is` | Today | আজি | today's | 0.81 | 1 | PASS |
| `today.played` | Games played today | আজি খেলা খেলসমূহ | today's games | 0.84 | 0.67 | PASS |
| `today.nothing_yet` | No games played yet today. | আজিও কোনো খেল খেলা হোৱা নাই। | No games have been played to date. | 0.7 | 0.6 | PASS |
| `home.circle.one` | person who cares for you | আপোনাৰ যত্ন লোৱা ব্যক্তি | The person who cares for you | 0.96 | 1 | PASS |
| `home.circle.many` | people who care for you | আপোনাৰ যত্ন লোৱা লোকসকল | People who care about you | 0.95 | 1 | PASS |
| `why.title` | Why these activities | কিয় এই কাৰ্যকলাপবোৰ | Why these activities | 1 | 1 | PASS |
| `why.intro` | Each activity works on one kind of thinking. This page says what each one is for. | প্ৰতিটো কাৰ্যকলাপে এক প্ৰকাৰৰ চিন্তাধাৰাৰ ওপৰত কাম কৰে। এই পৃষ্ঠাত কোৱা হৈছে যে প্ৰতিটো কিৰ বাবে। | Every activity works on a pattern of thought. This page states what each one is for. | 0.93 | 0.67 | PASS |
| `why.works_on` | What it works on | ই কি কাম কৰে | what does it do | 0.61 | 0.5 | PASS |
| `why.similar_to` | What it is similar to | এইটো কেনেকুৱা সদৃশ | how similar is this | 0.71 | 0.5 | PASS |
| `why.not_a_test` | SAATH is a tool for daily activities. It is not a medical test. It gives no score and no result. An activity that looks like a memory test is not the same as a memory test. | সাথ হৈছে দৈনন্দিন কাম-কাজৰ এক সঁজুলি। এয়া কোনো স্বাস্থ্য পৰীক্ষা নহয়। ই কোনো নম্বৰ নিদিয়ে আৰু কোনো ফলাফল নিদিয়ে। স্মৃতি পৰীক্ষাৰ দৰে দেখা এটা কাৰ্য্যকলাপ স্মৃতি পৰীক্ষাৰ দৰে একে নহয়। | Saath is a tool for daily chores. This is not a medical test. It gives no score and no result. An activity that looks like a memory test is not the same as a memory test. | 0.98 | 0.94 | PASS |
| `why.ask_doctor` | For any question about health, please speak to a doctor or a health worker. | স্বাস্থ্য সম্পৰ্কে যিকোনো প্ৰশ্নৰ বাবে, অনুগ্ৰহ কৰি চিকিৎসক বা স্বাস্থ্য কৰ্মীৰ সৈতে কথা পাতক। | For any health-related questions, please talk to a doctor or health worker. | 0.9 | 0.63 | PASS |
| `why.familiar_pairs.works_on` | Knowing the time of day, the day and the season | দিনটোৰ সময়, দিনটো আৰু ঋতু জানি লোৱা | Know the time of day, day, and season | 0.87 | 0.75 | PASS |
| `why.familiar_pairs.similar_to` | The orientation questions used in common memory checks | সাধাৰণ স্মৃতি পৰীক্ষাসমূহত ব্যৱহৃত অভিমুখীকৰণ প্ৰশ্নসমূহ | Orientation questions used in general memory tests | 0.86 | 0.67 | PASS |
| `why.familiar_pairs.reason` | Talking about today keeps a person joined to the present day. | আজিৰ বিষয়ে ক'বলৈ গ" লে এজন ব্যক্তিয়ে বৰ্তমানলৈকে জড়িত হৈ থাকে। | Talking about today, a person is involved in the present. | 0.63 | 0.63 | PASS |
| `why.sound_sight.works_on` | Understanding a spoken word and matching it to a picture | এটা কথিত শব্দ বুজি পোৱা আৰু ইয়াক এখন ছবিৰ সৈতে মিলোৱা | Understand a spoken word and match it to an image | 0.93 | 0.4 | PASS |
| `why.sound_sight.similar_to` | Naming and listening tasks | নাম দিয়া আৰু শুনাৰ কামসমূহ | Naming and Listening Tasks | 1 | 1 | PASS |
| `why.sound_sight.reason` | Matching a spoken word to its picture keeps words and objects connected. | এটা কথিত শব্দৰ সৈতে ইয়াৰ ছবিৰ মিল কৰিলে শব্দ আৰু বস্তু সংযুক্ত হৈ থাকে। | Matching a spoken word with its image keeps the word and object connected. | 0.95 | 0.67 | PASS |
| `why.pattern_garden.works_on` | Planning, and putting things into groups | পৰিকল্পনা কৰা, আৰু বস্তুবোৰ গোটত ৰখা | Planning, and putting things together | 0.83 | 0.6 | PASS |
| `why.pattern_garden.similar_to` | Sorting tasks that group objects by type | বস্তুবোৰক প্ৰকাৰ অনুসৰি গোট দিয়া কাৰ্য্যসমূহ শ্ৰেণীবদ্ধ কৰা | Classify tasks that group items by type | 0.76 | 0.67 | PASS |
| `why.pattern_garden.reason` | Sorting household things uses the same thinking as ordinary housework. | ঘৰুৱা বস্তুবোৰ ছৰ্ট কৰিলে সাধাৰণ ঘৰুৱা কামৰ দৰে একেই চিন্তাধাৰা ব্যৱহাৰ কৰা হয়। | Sorting household items uses the same thinking as ordinary housework. | 0.97 | 0.89 | PASS |
| `why.my_next_step.works_on` | Putting the steps of a task in the right order | এটা কামৰ পদক্ষেপবোৰ সঠিক ক্ৰমত ৰখা | Putting the steps of a task in the right order | 1 | 1 | PASS |
| `why.my_next_step.similar_to` | Ordering and sequencing tasks | অৰ্ডাৰ আৰু ক্ৰমবিন্যাসৰ কামসমূহ | Order and sequencing tasks | 0.98 | 0.67 | PASS |
| `why.my_next_step.reason` | A daily routine is easier when the order of its steps stays familiar. | এটা দৈনন্দিন ৰুটিন সহজ হয় যেতিয়া ইয়াৰ পদক্ষেপৰ ক্ৰম পৰিচিত থাকে। | A daily routine is easier when its sequence of steps is known. | 0.89 | 0.67 | PASS |
| `why.saah_pat.works_on` | Looking carefully, and staying with one task | সাৱধানে চাওক, আৰু এটা কামৰ সৈতে থাকক | Look carefully, and stick to one task | 0.83 | 0.5 | PASS |
| `why.saah_pat.similar_to` | Search tasks where one shape must be found among many | কামবোৰ সন্ধান কৰক য'ত বহুতোৰ মাজত এটা আকৃতি বিচাৰি পাব লাগিব | Look for tasks where you need to find one shape among many | 0.87 | 0.67 | PASS |
| `why.saah_pat.reason` | Looking for tea shoots is work many people here have done all their lives. | ইয়াত বহু লোকে গোটেই জীৱন ধৰি কৰি অহা এটা কাম হ'ল চাহৰ টুকুৰা বিচাৰি উলিওৱা। | One thing many people here have been doing all their lives is finding a cup of tea. | 0.73 | 0.64 | PASS |
| `why.apon_mukh.works_on` | Knowing faces, and remembering people | মুখবোৰ চিনি পোৱা, আৰু মানুহক মনত ৰখা | Recognizing faces, and remembering people | 0.93 | 0.75 | PASS |
| `why.apon_mukh.similar_to` | Tasks that join a face to a name | এটা নামৰ সৈতে এটা মুখ সংযোগ কৰা কাৰ্য্যসমূহ | Functions that connect a face to a name | 0.67 | 0.5 | PASS |
| `why.apon_mukh.reason` | Family photographs bring back memories that a drawing cannot. | পৰিয়ালৰ ফটোগ্ৰাফবোৰে স্মৃতিবোৰ ঘূৰাই আনে যিবোৰ এখন চিত্ৰই আনিব নোৱাৰে। | Family photographs bring back memories that a portrait cannot. | 0.87 | 0.86 | PASS |
| `why.together.works_on` | Talking with family about earlier days | পৰিয়ালৰ সৈতে আগৰ দিনবোৰৰ বিষয়ে কথা পাতি | Talking to family about the days ahead | 0.9 | 0.67 | PASS |
| `why.together.similar_to` | Reminiscence work used in group care | দলগত যত্নত ব্যৱহৃত স্মৃতিচিহ্নৰ কাম | Memento work used in group care | 0.66 | 0.8 | PASS |
| `why.together.reason` | Talking about earlier days together is calming, and needs no right answer. | আগৰ দিনবোৰৰ বিষয়ে একেলগে কথা পতাটো শান্ত, আৰু কোনো সঠিক উত্তৰৰ প্ৰয়োজন নাই। | It's calming to talk about the days ahead together, and no exact answers are needed. | 0.85 | 0.5 | PASS |
| `privacy.title` | What we keep, and where | আমি কি ৰাখিছোঁ, আৰু ক'ত ৰাখিছোঁ | What we keep, and where we keep it | 0.95 | 1 | PASS |
| `privacy.on_device` | Everything stays on this phone. The app works with no internet. | এই ফোনত সকলো থাকে। এপটোৱে ইণ্টাৰনেট অবিহনে কাম কৰে। | This phone has it all. The app works without the internet. | 0.83 | 0.5 | PASS |
| `privacy.stored_title` | What is kept on this phone | এই ফোনত কি ৰখা আছে | what's on this phone | 0.74 | 0.67 | PASS |
| `privacy.stored_list` | The name and age of the person, family photographs and voice notes, reminders, care notes, and a record of each activity. | ব্যক্তিজনৰ নাম আৰু বয়স, পৰিয়ালৰ ফটোগ্ৰাফ আৰু ভইচ নোট, ৰিমাইণ্ডাৰ, কেয়াৰ নোট, আৰু প্ৰতিটো কাৰ্যকলাপৰ ৰেকৰ্ড। | The person's name and age, family photographs and voice notes, reminders, care notes, and records of each activity. | 0.97 | 0.92 | PASS |
| `privacy.locked_title` | What is locked | কি লক কৰা আছে | what's locked | 0.94 | 1 | PASS |
| `privacy.locked` | The name, the care plan text, the care notes, the photographs and the voice notes are locked with AES-256-GCM encryption while they sit on this phone. The key is made on this phone and kept in the phone secure store. | এই ফোনত বহি থকাৰ সময়ত নাম, যত্ন পৰিকল্পনাৰ লিখনি, যত্নৰ টোকা, ফটোগ্ৰাফ আৰু ভইচ টোকাবোৰ এইএছ-256-জিচিএম এনক্ৰিপশ্যনৰ সৈতে লক কৰা হয়। চাবিটো এই ফোনত তৈয়াৰ কৰা হয় আৰু ফোন সুৰক্ষিত দোকানত ৰখা হয়। | Names, care plan text, care notes, photographs, and voice notes are locked with AES-256-GCM encryption while sitting on this phone. The key is made on this phone and the phone is kept in a safe. | 0.93 | 0.76 | PASS |
| `privacy.leaves_title` | What leaves this phone | এই ফোনটোৰ পৰা কি ওলায় | what comes out of this phone | 0.82 | 0.67 | PASS |
| `privacy.leaves` | Nothing leaves this phone unless a family member turns on syncing. | পৰিয়ালৰ কোনো সদস্যই ছিংকিং অন নকৰালৈকে এই ফোনটোৰ পৰা একোৱেই ওলাই নাযায়। | Nothing comes out of this phone until a family member turns on the syncing. | 0.87 | 0.75 | PASS |
| `privacy.sync_on` | When syncing is on, only the record of the activities is sent: which activity, when, and how it went. Photographs, voice notes, names and care notes are never sent. | সংমিশ্ৰণ চলি থকাৰ সময়ত কেৱল কাৰ্য্যকলাপসমূহৰ ৰেকৰ্ড প্ৰেৰণ কৰা হয়ঃ কোনটো কাৰ্য্যকলাপ, কেতিয়া, আৰু ই কেনেদৰে চলিছিল। ফটোগ্ৰাফ, ভইচ নোট, নাম আৰু কেয়াৰ নোট কেতিয়াও প্ৰেৰণ কৰা নহয়। | Only records of operations are sent while the combination is running: which operation, when, and how it ran. Photographs, voice notes, names, and care notes are never sent. | 0.61 | 0.69 | PASS |
| `privacy.delete_title` | How to remove everything | কেনেকৈ সকলোবোৰ আঁতৰাব পাৰি | How to Remove Everything | 1 | 1 | PASS |
| `privacy.delete_how` | The button below removes every person on this phone, with their photographs, voice notes, reminders, notes and activity records. | তলৰ বুটামটোৱে এই ফোনত থকা প্ৰতিজন ব্যক্তিক তেওঁলোকৰ ফটো, ভইচ নোট, ৰিমাইণ্ডাৰ, নোট আৰু এক্টিভিটি ৰেকৰ্ডৰ সৈতে আঁতৰাই দিয়ে। | The bottom button removes each person on this phone, along with their photos, voice notes, reminders, notes, and activity records. | 0.88 | 0.79 | PASS |
| `privacy.delete_button` | Remove everything from this phone | এই ফোনটোৰ পৰা সকলোবোৰ আঁতৰাওক | Remove everything from this phone | 1 | 1 | PASS |
| `privacy.delete_confirm` | Tap again to remove everything | সকলো আঁতৰাবলৈ পুনৰ টেপ কৰক | Tap again to remove everything | 1 | 1 | PASS |
| `privacy.deleted` | Everything has been removed from this phone. | এই ফোনটোৰ পৰা সকলো আঁতৰাই পেলোৱা হৈছে। | Everything has been removed from this phone. | 1 | 1 | PASS |
| `privacy.dpdp` | India's Digital Personal Data Protection Act, 2023 asks that personal data is kept safely, and only for as long as it is needed. This page says what the app does. It is not a claim of certification. | ভাৰতৰ ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা আইন, 2023-ত কোৱা হৈছে যে ব্যক্তিগত তথ্য সুৰক্ষিতভাৱে ৰখা হয়, আৰু কেৱল প্ৰয়োজনৰ সময়লৈকেহে ৰখা হয়। এই পৃষ্ঠাটোৱে এপটোৱে কি কৰে সেই বিষয়ে কয়। এয়া প্ৰমাণপত্ৰৰ দাবী নহয়। | India's Digital Personal Data Protection Act, 2023 states that personal data is kept securely, and only for as long as is necessary. This page talks about what the app does. This is not a certification requirement. | 0.95 | 0.76 | PASS |
| `mood.question` | How do you feel now? | আপুনি এতিয়া কেনে অনুভৱ কৰে? | How do you feel now? | 1 | 1 | PASS |
| `mood.good` | Good | ভাল হৈছে | It's good | 0.67 | 1 | PASS · LONG |
| `mood.ok` | All right | ঠিক আছে | All right | 1 | 1 | PASS |
| `mood.low` | Not good | ভাল নহয় | it's not good | 0.75 | 1 | PASS |
| `strip.usual` | This week is about the same as usual for this person. | এই ব্যক্তিগৰাকীৰ বাবে এই সপ্তাহটো প্ৰায় স্বাভাৱিকৰ দৰেই একে। | For this person, this week is almost the same as usual. | 0.95 | 0.83 | PASS |
| `strip.fewer` | Fewer activities this week than usual for this person. | এই ব্যক্তিগৰাকীৰ বাবে এই সপ্তাহত স্বাভাৱিকতকৈ কম কাৰ্যকলাপ। | Less activity than usual this week for this person. | 0.9 | 0.67 | PASS |
| `strip.more` | More activities this week than usual for this person. | এই ব্যক্তিগৰাকীৰ বাবে এই সপ্তাহত স্বাভাৱিকতকৈ অধিক কাৰ্যকলাপ। | This week is more activity than usual for this person. | 0.92 | 0.83 | PASS |
| `strip.quiet` | No activity for three days or more. | তিনি দিন বা তাতকৈ অধিক সময় ধৰি কোনো কাৰ্যকলাপ নহয়। | No activity for three days or more. | 1 | 1 | PASS |
| `strip.early` | The first days are still being collected. | প্ৰথম দিনবোৰ এতিয়াও সংগ্ৰহ কৰা হৈছে। | The first days are still being collected. | 1 | 1 | PASS |
| `strip.reminders_down` | Fewer reminders were marked done this week than usual. | এই সপ্তাহত স্বাভাৱিকতকৈ কম ৰিমাইণ্ডাৰ চিহ্নিত কৰা হৈছিল। | This week marked fewer reminders than usual. | 0.94 | 0.75 | PASS |
| `trend.title` | The last 30 days | শেষৰ 30 দিন | The last 30 days | 1 | 1 | PASS |
| `trend.days_joined` | of the last 7 days had an activity | যোৱা 7 দিনৰ ভিতৰত এটা কাৰ্য্যকলাপ আছিল | There was an activity within the last 7 days | 0.95 | 0.75 | PASS |
| `trend.days_before` | in the 7 days before that | তাৰ আগৰ 7 দিনত | In the last 7 days | 0.76 | 0.5 | PASS |
| `trend.sessions` | activities in 30 days | 30 দিনৰ ভিতৰত কাৰ্যকলাপ | Activities within 30 days | 0.96 | 1 | PASS |
| `trend.unaided` | activities finished with no help this week | এই সপ্তাহত কোনো সহায় নোহোৱাকৈ সমাপ্ত হোৱা কাৰ্যকলাপসমূহ | Activities that ended with no help this week | 0.91 | 0.83 | PASS |
| `trend.unaided_before` | in the week before | আগৰ সপ্তাহত | in the previous week | 0.87 | 0.5 | PASS |
| `trend.reminders` | of the reminders this week were marked done | এই সপ্তাহত চিহ্নিত কৰা ৰিমাইণ্ডাৰসমূহ সম্পূৰ্ণ কৰা হৈছিল | The reminders marked this week were completed | 0.94 | 0.8 | PASS |
| `trend.too_little` | There is not enough here yet to show a pattern. It fills in as the days go by. | ইয়াত এটা আৰ্হি দেখুৱাবলৈ এতিয়াও যথেষ্ট নাই। দিন যোৱাৰ লগে লগে ই ভৰি পৰে। | It does not yet have enough to show a model. It fills up as the day progresses. | 0.47 | 0.6 | PASS |
| `trend.each_bar` | Each bar shows one day. | প্ৰতিটো বাৰে এদিন প্ৰদৰ্শন কৰে। | Each bar performs one day. | 0.88 | 0.8 | PASS |
| `trend.observational` | These are counts of what happened. They are not a health measure. | এইবোৰ হৈছে কি ঘটিছিল তাৰ গণনা। এইবোৰ স্বাস্থ্যৰ মাপকাঠি নহয়। | These are calculations of what happened. These are not measures of health. | 0.85 | 0.63 | PASS |
| `trend.mood_said` | How this person said they felt after an activity | এই ব্যক্তিয়ে কেনেদৰে কৈছিল যে তেওঁলোকে এটা কাৰ্য্যকলাপৰ পিছত অনুভৱ কৰিছিল | How this person said they felt after an activity | 1 | 1 | PASS |
| `day.title` | How today went | আজি কেনেকুৱা আছিল | how was today | 0.88 | 0.67 | PASS |
| `day.activities` | activities today | আজিৰ কাৰ্যকলাপসমূহ | today's activities | 0.94 | 1 | PASS |
| `day.no_help` | of them finished with no help | তেওঁলোকৰ কোনো সহায় নোহোৱাকৈ সমাপ্ত হৈছিল | They ended up with no help | 0.73 | 0.6 | PASS |
| `day.reminders` | of the reminders for today are marked done | আজিৰ বাবে ৰিমাইণ্ডাৰবোৰ চিহ্নিত কৰা হৈছে | Marked reminders for today | 0.9 | 0.75 | PASS |
| `day.nothing` | Nothing has been recorded today yet. | আজিও একো নথিভুক্ত কৰা হোৱা নাই। | Nothing has been recorded to date. | 0.82 | 0.67 | PASS |
