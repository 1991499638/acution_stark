import pandas as pd
import json

# 从JSON文件加载数据
with open('10.json') as json_file:
    data = json.load(json_file)

# 创建一个空的DataFrame
df = pd.DataFrame()

# 遍历每个数据块
for entry in data:
    account_value = entry["accounts"]
    time_data = entry["time"]
    gas_data = entry["gas"]

    # 添加账户信息
    df = df.append({"accounts": account_value}, ignore_index=True)

    # 添加时间相关信息
    for time_entry in time_data:
        for key, value in time_entry.items():
            df.loc[df.index[-1], f"time_{key}"] = value

    # 添加Gas相关信息
    for gas_entry in gas_data:
        for key, value in gas_entry.items():
            df.loc[df.index[-1], f"gas_{key}"] = value

# 将数据保存为Excel文件
df.to_excel('output10.xlsx', index=False)



