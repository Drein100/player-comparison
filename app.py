import requests
import pandas as pd
import json
import os

# League information
league_info = {
    'Bundesliga': {'id': 54, 'season': 23794},
    'La Liga': {'id': 87, 'season': 23686},
    'Premier League': {'id': 47, 'season': 23685},
    'Serie A': {'id': 55, 'season': 23819},
    'Ligue 1': {'id': 53, 'season': 23724},
    'Super Lig': {'id': 71, 'season': 23864},
    'Champions League': {'id': 42, 'season': 24110},
    'Europa League': {'id': 73, 'season': 24112}
}

player_stats = {
    "FotMob Rating": 'rating',
    "Goals": 'goals',
    "Expected Goals (xG)": 'expected_goals',
    "Goals (per match)": 'goals_per_90',
    "Expected Goals (xG - per match)": 'expected_goals_per_90',
    "Assists": 'goal_assist',
    "Expected Assists (xA)": 'expected_assists',
    "Expected Assists (xA - per match)": 'expected_assists_per_90',
    "Goals + Assists": '_goals_and_goal_assist',
    "xG + xA (per match)": '_expected_goals_and_expected_assists_per_90',
    "Goals Conceded (per match)": 'goals_conceded',
    "Goals Prevented": '_goals_prevented',
    "Shots (per match)": 'total_scoring_att',
    "Shots on Target (per match)": 'ontarget_scoring_att',
    "Big Chances Created": 'big_chance_created',
    "Big Chances Missed": 'big_chance_missed',
    "Penalties Awarded": 'penalty_won',
    "Penalties Conceded": 'penalty_conceded',
    "Accurate Long Balls (per match)": 'accurate_long_balls',
    "Accurate Passes (per match)": 'accurate_pass',
    "Successful Dribbles (per match)": 'won_contest',
    "Possession Won Final 3rd (per match)": 'poss_won_att_3rd',
    "Blocks (per match)": 'outfielder_block',
    "Successful Tackles (per match)": 'won_tackle',
    "Clearances (per match)": 'effective_clearance',
    "Interceptions (per match)": 'interception',
    "Fouls (per match)": 'fouls',
    "Saves (per match)": 'saves',
    "Save Percentage": '_save_percentage',
    "Clean Sheets": 'clean_sheet',
    "Red Card": 'red_card',
    "Yellow Card": 'yellow_card'  
}

def fetch_team_data(league_name, stat_name):
    league_name = capitalize_words(league_name)

    headers = {
        'Referer': 'https://www.fotmob.com',
        'Accept': '*/*',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0',
    }

    league = league_info.get(league_name)
    stat = player_stats.get(stat_name)

    if league is None or stat is None:
        raise ValueError("Geçersiz lig adı veya istatistik adı.")

    params = {
        'id': league['id'],
        'season': league['season'],
        'type': 'players',
        'stat': stat,
    }

    response = requests.get('https://www.fotmob.com/api/leagueseasondeepstats', params=params, headers=headers)
    data = response.json()

    # İstatistik verilerini al
    stats_data = data['statsData']
    names = [item['name'] for item in stats_data]
    stat_values = [item['statValue']['value'] for item in stats_data]

    # Oyuncu ID'lerini ve resim URL'lerini al
    player_ids = [item['id'] for item in stats_data]
    player_images = [f'https://images.fotmob.com/image_resources/playerimages/{player_id}.png' for player_id in player_ids]

    # DataFrame oluştur
    df = pd.DataFrame({
        'Takım': names,
        stat_name: stat_values,
        'Oyuncu Resmi': player_images  # Oyuncu resmini ekle
    })

    return df

def compare_teams(league_name, stat_names):
    combined_stats = {}

    for stat_name in stat_names:
        df_team = fetch_team_data(league_name, stat_name)

        # İstatistikleri sözlükte sakla
        for index, row in df_team.iterrows():
            if row['Takım'] not in combined_stats:
                combined_stats[row['Takım']] = {'Oyuncu Resmi': row['Oyuncu Resmi']}  # Oyuncu resmini ekle
            # Değerleri yuvarlayarak ekle
            combined_stats[row['Takım']][stat_name] = round(row[stat_name], 1)

    # DataFrame oluştur
    final_df = pd.DataFrame(combined_stats).T
    final_df.reset_index(inplace=True)
    final_df.rename(columns={'index': 'Takım'}, inplace=True)

    # NaN değerlerini 0.0 ile doldur
    final_df.fillna(0.0, inplace=True)

    return final_df

def capitalize_words(text):
    return ' '.join(word.capitalize() for word in text.split())

# Örnek kullanım
stat_names = list(player_stats.keys())  # Tüm istatistik isimlerini al

# JSON dosyalarını kaydedeceğimiz klasörün adı
output_dir = 'jsons'

# Klasörün var olup olmadığını kontrol et, yoksa oluştur
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Tüm ligler için verileri oluştur ve JSON dosyalarına kaydet
for league in league_info.keys():
    team_stats_df = compare_teams(league, stat_names)

    # JSON verisini bir dosyaya yaz
    team_stats_json = team_stats_df.set_index('Takım').T.to_json(orient='index')
    file_name = f"{league}.json"
    file_path = os.path.join(output_dir, file_name)
    
    with open(file_path, 'w', encoding='utf-8') as json_file:
        json.dump(json.loads(team_stats_json), json_file, indent=4, ensure_ascii=False)
