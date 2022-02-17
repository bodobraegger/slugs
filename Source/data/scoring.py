from copy import copy
import csv
from scipy import stats
from pingouin import ancova
from math import floor
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import numpy as np
from statistics import mean, stdev
from math import sqrt
from pprint import pprint

import pandas as pd

headers_demo = [
 'code','gender', 'cs_exp', 'js_exp', 'video_games', 'age', 'native_tongue', 'english', 'math_grade', 
 ]
cats = ['Confidence', 'Interest', 'Belongingness', 'Usefulness', 'Encouragement']
headers_haynie = ['attitude_cs_haynie']
headers_haynie += [f'attitude_cs_haynie.{c}' for c in cats]


headers_questionnaires = ['PRE.test', 'PRE.attitude_games_chang', 'PRE.attitude_cs_weston'] + [f'PRE.{h}' for h in headers_haynie]  + ['POST.test', 'POST.test.js', 'POST.sus_brooke', 'POST.sus_brooke.q1', 'POST.attitude_cs_weston'] + [f'POST.{h}' for h in headers_haynie]
 
headers_delta = ['DELTA.test', 'DELTA.attitude_cs_weston'] + [f'DELTA.{h}' for h in headers_haynie]
headers = headers_demo + headers_questionnaires + headers_delta

def plot_hist(all,a,b,title,label_a, label_b):
    colors = plt.rcParams['axes.prop_cycle'].by_key()['color']
    fig, ax = plt.subplots(1,1)
    plt.title(title)
    plt.hist([a, b], label = [f'{label_a}', f'{label_b}'], rwidth=1)
    
    plt.axvline(a.mean(), linestyle='dashed', linewidth=1, color=colors[0])
    min_ylim, max_ylim = plt.ylim()
    plt.text(a.mean()+.1, max_ylim*0.9, f'Mean - {label_a}: {a.mean() :.2f}')

    plt.axvline(b.mean(), linestyle='dashed', linewidth=1, color=colors[1])
    min_ylim, max_ylim = plt.ylim()
    plt.text(b.mean()+.1, max_ylim*0.7, f'Mean - {label_b}: {b.mean() :.2f}')

    plt.axvline(all.mean()+.1, linestyle='dashed', linewidth=1, color=colors[2])
    min_ylim, max_ylim = plt.ylim()
    plt.text(all.mean(), max_ylim*0.8, f'Mean - All: {all.mean() :.2f}')

    plt.legend(loc='upper left')
    ax.xaxis.set_major_locator(ticker.MultipleLocator(1))

def merge(): 
    """ used to merge pre and post test data that has since been discarded """
    with open('study_pre.csv') as pre, open('study_post.csv') as post, open('merged.csv', 'w') as new:
        r1 = csv.DictReader(pre)
        r2 = csv.DictReader(post)
        relevant_rows = []
        for row_pre in r1:
            for row_post in r2:
                code_submitted = row_post['hello.1.player.questionnaire_pre_code'].lower().replace(' demo','')
                if(row_pre['participant.code'] == code_submitted):
                    relevant_rows += [dict(**{f'PRE.{k}': v for k, v in row_pre.items()}, **{f'POST.{k}': v for k, v in row_post.items()})]

        print(relevant_rows[0].keys())
        w = csv.writer(new)
        w.writerow(relevant_rows[0].keys())
        w.writerows([r.values() for r in relevant_rows])

def score_and_clean(input='merged.csv', tests_input = 'test_scores.csv', output=None, incompletion_cutoff=4, output_raw_filtered=None, plot=False):
    """ score the standardized questionnaires, clean up incomplete data """
        # scoring:
        # attitude_games_chang: sum each + 1
        # attitude_cs_haynie: sum each + 1 per category of 5: Confidence, Interest, Belongingness, Usefulness, Encouragement

        # attitude_cs_weston: sum each + 1
        # sus_brooke: odd question v directly, even question 4-v

    with open(input) as f:
        r = csv.DictReader(f)
        answers = dict()
        questionnaire_headers = dict()
        questionnaire_headers['PRE.attitude_games_chang'] = []
        questionnaire_headers['PRE.attitude_cs_haynie'] = []
        questionnaire_headers['PRE.attitude_cs_weston'] = []
        questionnaire_headers['POST.attitude_cs_haynie'] = []
        questionnaire_headers['POST.attitude_cs_weston'] = []
        questionnaire_headers['POST.sus_brooke'] = []
        game_choices = ["Every day", "Several times a week", "Once a week", "Once a month", "Less"]
        game_choices.reverse()


        for i, participant_row in enumerate(r):
            code = participant_row['PRE.participant.code']
            for j, v in enumerate(participant_row.values()):
                for q in questionnaire_headers:
                    if(i==0):
                        answers[q] = dict()
                        qsplit = q.split('.')
                        if(v==qsplit[-1] and list(participant_row.keys())[j].split('.')[0] == qsplit[0]): questionnaire_headers[q] += [list(participant_row.keys())[j].replace('.group.questionnaire', '')]
                    answers[q][code] = dict()
                    answers[q][code]['score']=0
                    answers[q][code]['incomplete']=[]
                    if 'attitude_cs_haynie' in q:
                        for c in cats:
                            answers[q][code][c]=dict()
                            answers[q][code][c]['score']=0
            
                for q in questionnaire_headers:
                    qs_count = 0
                    for h in questionnaire_headers[q]:
                        
                        answers[q][code]['gender']=participant_row[f'PRE.demographics.1.player.gender']
                        if(participant_row[f'PRE.demographics.1.player.gender'] ==''):
                            answers[q][code]['gender']=participant_row['POST.demographics.1.player.gender']
                        answers[q][code]['cs_exp']=participant_row[f'PRE.demographics.1.player.cs_experience']
                        answers[q][code]['js_exp']=participant_row[f'PRE.demographics.1.player.js_experience']
                        answers[q][code]['video_games']=game_choices.index(participant_row[f'PRE.demographics.1.player.video_games'])
                        answers[q][code]['age']=participant_row[f'PRE.demographics.1.player.age']
                        answers[q][code]['native_tongue']=participant_row[f'PRE.demographics.1.player.mother_tongue']
                        answers[q][code]['english']=participant_row[f'PRE.demographics.1.player.english_understanding']
                        answers[q][code]['math_grade']=participant_row[f'PRE.demographics.1.player.math_grade']
                        
                        if(participant_row[f'{h}.player.answer']): 
                            if(participant_row[f'{h}.group.questionnaire'] in ['attitude_games_chang', 'attitude_cs_weston']):
                                answers[q][code]['score'] += float(participant_row[f'{h}.player.answer'])+1
                            elif(participant_row[f'{h}.group.questionnaire'] == 'attitude_cs_haynie'):
                                # LIKERT 4: per category?
                                answers[q][code]['score'] += float(participant_row[f'{h}.player.answer'])+1
                                cat_index = floor(qs_count/5)
                                answers[q][code][cats[cat_index]]['score'] += float(participant_row[f'{h}.player.answer'])+1
                                qs_count+=1


                            elif(participant_row[f'{h}.group.questionnaire'] == 'sus_brooke'):
                                if(float(participant_row[f'{h}.subsession.round_number']) % 2):
                                    # odd
                                    answers[q][code]['score'] += float(participant_row[f'{h}.player.answer'])
                                    if float(participant_row[f'{h}.subsession.round_number']) == 1:
                                        answers[q][code]['q1'] = float(participant_row[f'{h}.player.answer'])
                                else:
                                    # even
                                    answers[q][code]['score'] += 4-float(participant_row[f'{h}.player.answer'])
                        elif not participant_row[f'{h}.player.answer']: 
                            answers[q][code]['incomplete']+= [f'{h}.group.question']
                            if(participant_row[f'{h}.group.questionnaire'] == 'attitude_games_chang'):
                                answers[q][code]['score'] += 3 # LIKERT 5
                            elif(participant_row[f'{h}.group.questionnaire'] == 'attitude_cs_weston'):
                                answers[q][code]['score'] += 2.5 # LIKERT 4: 2 or 2.5?
                            elif(participant_row[f'{h}.group.questionnaire'] == 'attitude_cs_haynie'):
                                answers[q][code]['score'] += 2.5 # LIKERT 4: per category?
                                cat_index = floor(qs_count/5)
                                answers[q][code][cats[cat_index]]['score'] += 2.5
                                qs_count+=1
                            elif(participant_row[f'{h}.group.questionnaire'] == 'sus_brooke'):
                                answers[q][code]['score'] += 2 # LIKERT 5, 0-4

        # pprint(answers, sort_dicts=False)
        incomplete = dict()
        multiple_incomplete = []


        for q in answers:
            incomplete[q] =dict()
            for p in answers[q]:
                if(len(answers[q][p]['incomplete'])>=incompletion_cutoff):
                    incomplete[q][p]=len(answers[q][p]['incomplete'])
                    multiple_incomplete += [p]
                    print(q, p, len(answers[q][p]['incomplete']), answers[q][p]['incomplete'])


        answers_complete = copy(answers)
        for q in answers_complete:
            answers_complete[q] = dict()
            for p in answers[q]:
                if p not in multiple_incomplete:
                    answers_complete[q][p] = answers[q][p]
                


        # pprint(answers_complete, sort_dicts=False)
        gender_participants = {'Male':set(), 'Female':set(), 'Other/NoAnswer':set()}
        for q in answers_complete:
            for p in answers_complete[q]:
                if answers_complete[q][p]['gender'] in gender_participants:
                    gender_participants[answers_complete[q][p]['gender']].add(p)
                else:
                    gender_participants['Other/NoAnswer'].add(p)


        participant_answers = dict()

        for h in headers:
            for q in answers_complete:
                for p in answers_complete[q]:
                    if not participant_answers.get(p):
                        participant_answers[p] = dict()
                    if not participant_answers[p].get(h):
                        participant_answers[p][h]=-1
                    else: break
                    if(participant_answers[p][h] != -1): break
                    if(h=='code'):
                        participant_answers[p][h] = p
                    if h in answers_complete[q][p]:
                        participant_answers[p][h]=answers_complete[q][p][h]
                    if q == h:
                        participant_answers[p][h]=answers_complete[q][p]['score']



        with open(tests_input) as f:
            tests_reader = csv.DictReader(f)
            for row in tests_reader:
                for h in headers_questionnaires+headers_delta:
                    if not row['code'] or not row.get(h): continue
                    if(participant_answers[row['code']][h] != -1): continue
                    if h in row:
                        participant_answers[row['code']][h] = float(row[h])                            
            
        for h in headers:
            for q in answers_complete:
                for p in answers_complete[q]:
                    if(participant_answers[p][h] != -1): break
                    if q == h:
                        participant_answers[p][h]=answers_complete[q][p]['score']
                    elif q in h:
                        for c in cats:
                            if c in h:
                                participant_answers[p][h]=answers_complete[q][p][c]['score']
                    if 'DELTA.' in h:
                        participant_answers[p][h] = participant_answers[p][h.replace('DELTA.', 'POST.')] - participant_answers[p][h.replace('DELTA.', 'PRE.')]

                    if h=='POST.sus_brooke' and answers_complete[q][p].get('q1') is not None:
                        participant_answers[p][f'{h}.q1'] = answers_complete[q][p].get('q1')
        # pprint(answers_complete, sort_dicts=False)
        # pprint(participant_answers, sort_dicts=False)
                

        # df = pd.DataFrame(gender_participants)
        # df.hist(columns=gender_participants.keys(), bins=len(gender_participants))
        for g in gender_participants:
            print(g, len(gender_participants[g]))
        
        data = [participant_answers[p].values() for p in participant_answers]
        
        if(plot): plt.show()

        if(output):
            with open(output, 'w') as o:
                w = csv.writer(o)
                w.writerow(headers)
                w.writerows(data)
        if(output_raw_filtered):
            f.seek(0)
            with open(output_raw_filtered, 'w') as o:
                w = csv.writer(o)
                for i, participant_row in enumerate(r):
                    if(i==0):
                        print(participant_row)
                        w.writerow(participant_row.keys())
                    if(participant_row['PRE.participant.code'] in participant_answers):
                        w.writerow(participant_row.values())
                

def plot(input):
    df = pd.read_csv(input)
    print(df)
    df_male, df_flinta = df[(mask:=df.gender == 'Male')], df[~mask]
    # df_male.hist()
    # df_flinta.hist()
    plt.style.use('tableau-colorblind10')

    headers_relevant = [h for h in headers_questionnaires if 'attitude' not in h] + headers_delta

    # analysis: 
    # visualize
    # compare boys vs girls from before intervention, then after intervention, and overall from before to after
    # for attitudes: you only check deltas
    # test normality: shapiro wilk, if normal: normal T test
        # if not: non-parametric T test
    # null-hypo: no effect, e.g. no difference between girls and boys
    # p value: probability that we observe null-hypo to be true, we want it to be < 0.05
    # ancova to control for differences present before intervention

    for c in headers_relevant:
        stat, p = stats.shapiro(df_flinta[c])
        print(f'shapiro-wilk (flinta*): {c : <38} : {stat= :.3f}, {p= :.3f}')
        stat, p = stats.shapiro(df_male[c])
        print(f'shapiro-wilk (male)   : {c : <38} : {stat= :.3f}, {p= :.3f}')

    for c in headers_relevant:
        _, p_f = stats.shapiro(df_flinta[c])
        _, p_m = stats.shapiro(df_male[c])
        
        stat, p, out = None, None, None

        if(p_f <= 0.05 and p_m <= 0.05):
            stat, p = stats.ttest_ind(df_flinta[c], df_male[c])
            out = f't-test (ind.): {c : <38} : {stat= :.3f}, {p= :.3f}'
        else:
            stat, p = stats.ttest_ind(df_flinta[c], df_male[c], trim=0.2)
            out = f't-test (yuen): {c : <38} : {stat= :.3f}, {p= :.3f}'

        cohens_d = (mean(df_flinta[c]) - mean(df_male[c])) / (sqrt((stdev(df_flinta[c]) ** 2 + stdev(df_male[c]) ** 2) / 2))
        print(f'{out}, {cohens_d= :.3f}')


    # print(ancova(data=df, dv='POST.test', covar='POST.test.js', between='gender', ))


    d = 'POST.sus_brooke'
    df_gamers, df_nongamers = df[(mask:=df.video_games > 1)], df[~mask]

    _, p_f = stats.shapiro(df_gamers[d])
    _, p_m = stats.shapiro(df_nongamers[d])
        
    stat, p, out = None, None, None
    if(p_f <= 0.05 and p_m <= 0.05):
        stat, p = stats.ttest_ind(df_gamers[d], df_nongamers[d])
        t = d+' gamers-nongamers'
        out = f't-test (ind.): {t : <38} : {stat= :.3f}, {p= :.3f}'
    else:
        t = d+' gamers-nongamers'
        stat, p = stats.ttest_ind(df_gamers[d], df_nongamers[d], trim=0.2)
        out = f't-test (yuen): {t : <38} : {stat= :.3f}, {p= :.3f}'

    cohens_d = (mean(df_gamers[c]) - mean(df_nongamers[c])) / (sqrt((stdev(df_gamers[c]) ** 2 + stdev(df_nongamers[c]) ** 2) / 2))
    print(f'{out}, {cohens_d= :.3f}')

    df_flinta_gamers, df_flinta_nongamers = df_flinta[(mask:=df.video_games > 1)], df_flinta[~mask]
    df_male_gamers, df_male_nongamers = df_male[(mask:=df.video_games > 1)], df_male[~mask]
    print(f'{len(df_flinta_gamers)=}, {len(df_flinta_nongamers)=}, {len(df_male_gamers)=},{len(df_male_nongamers)=}')


    plot_hist(df[d], df_gamers[d], df_nongamers[d], d, 'Gamers', 'Non-Gamers (1/month or less)')
    for d in headers_relevant:
        plot_hist(df[d], df_flinta[d], df_male[d], d, 'FLINTA*', 'Male')
    

    plt.show()




# score_and_clean(output='scored.csv', incompletion_cutoff=3)
plot('scored.csv')

