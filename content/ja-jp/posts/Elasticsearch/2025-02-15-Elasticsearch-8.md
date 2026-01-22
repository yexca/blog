---
slug: 235
title: 'Elasticsearch クラスター'
# draft: true
author: yexca
date: '2025-02-15T17:17:08+09:00'
categories:
    - 技術学習
tags:
    - バックエンド技術
    - Elasticsearch
    - SpringCloud
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

> **Elasticsearch シリーズ**
>
> | 内容                   | リンク                                  |
> | :--------------------- | :------------------------------------ |
> | Elasticsearch 基本操作 | <https://blog.yexca.net/ja/archives/226> |
> | Elasticsearch 検索操作 | <https://blog.yexca.net/ja/archives/227> |
> | RestClient 基本操作 | <https://blog.yexca.net/ja/archives/228> |
> | RestClient 検索操作 | <https://blog.yexca.net/ja/archives/229> |
> | Elasticsearch データ集約 | <https://blog.yexca.net/ja/archives/231> |
> | Elasticsearch オートコンプリート | <https://blog.yexca.net/ja/archives/232> |
> | Elasticsearch データ同期 | <https://blog.yexca.net/ja/archives/234> |
> | Elasticsearch クラスター | この記事 |

ESを単体でデータ保存に使うと、どうしても二つの問題に直面するんだ。大量のデータ保存と単一障害点の問題だね。

*   大量データ保存の問題：インデックスを論理的にN個のシャードに分割して、複数のノードに保存する。
*   単一障害点の問題：シャードデータを異なるノードにバックアップ（レプリカ）する。

ESクラスター関連の概念

*   クラスター (cluster)：共通のクラスター名を持つノードのグループのこと。
*   ノード (node)：クラスター内のESインスタンスの一つだよ。
*   シャード (shard)：インデックスは異なる部分に分割して保存できるんだ。これをシャードと呼ぶよ。クラスター環境では、一つのインデックスの異なるシャードを別々のノードに分割して保存できるんだ。

解決する問題：データ量が多すぎたり、単一ノードの保存量が限られている問題。

> シャードはHadoopのHDFSでデータを複数に分けてバックアップするのに似てるね。

*   プライマリシャード (Primary shard)：レプリカシャードとの対比で定義されるよ。
*   レプリカシャード (Replica shard)：各プライマリシャードは一つ以上のレプリカを持つことができて、データはプライマリシャードと同じなんだ。

## ESクラスターの構築

docker-composeを使えばできるよ。

```yml
version: '2.2'
services:
  es01:
    image: elasticsearch:7.12.1
    container_name: es01
    environment:
      - node.name=es01
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es02,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - data01:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - elastic
  es02:
    image: elasticsearch:7.12.1
    container_name: es02
    environment:
      - node.name=es02
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es03
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - data02:/usr/share/elasticsearch/data
    ports:
      - 9201:9200
    networks:
      - elastic
  es03:
    image: elasticsearch:7.12.1
    container_name: es03
    environment:
      - node.name=es03
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=es01,es02
      - cluster.initial_master_nodes=es01,es02,es03
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - data03:/usr/share/elasticsearch/data
    networks:
      - elastic
    ports:
      - 9202:9200
volumes:
  data01:
    driver: local
  data02:
    driver: local
  data03:
    driver: local

networks:
  elastic:
    driver: bridge
```

ESを動かすにはLinuxのシステム権限をいくつか変更する必要があるんだ。`/etc/sysctl.conf` ファイルを編集するよ。

```sh
vi /etc/sysctl.conf
```

以下の内容を追加してね：

```sh
vm.max_map_count=262144
```

それから、コマンドを実行して設定を有効にするんだ：

```sh
sysctl -p
```

docker-composeでクラスターを起動するよ：

```sh
docker-compose up -d
```

## クラスターの状態監視

KibanaでもESクラスターを監視できるけど、ESのX-Pack機能に依存するから設定がちょっと複雑なんだ。

Cerebroを使ってESクラスターを監視することもできるよ。Githubはこちら：<https://github.com/lmenezes/cerebro>

`bin/cerebro.bat` を実行したら <http://localhost:9000> にアクセスするだけで管理画面に入れるよ。

Cerebroを使えばインデックスを視覚的に作成できるんだ。以下はDSLステートメントでの作成例だよ。

```json
PUT /indexName
{
  "settings": {
    "number_of_shards": 3, // シャード数
    "number_of_replicas": 1 // レプリカ数
  },
  "mappings": {
    "properties": {
      // マッピング定義 ...
    }
  }
}
```

## クラスターの役割分担

ESのクラスターノードには異なる役割があるんだ。

| ノードタイプ        | 設定パラメータ                                       | デフォルト値 | ノードの役割                                                     |
| --------------- | ---------------------------------------------- | ------ | ------------------------------------------------------------ |
| マスター適格 | node.master                                    | true   | 候補マスターノード：マスターノードはクラスターの状態を管理・記録したり、シャードがどのノードにあるかを決めたり、インデックスの作成・削除リクエストを処理したりできるよ。 |
| データ            | node.data                                      | true   | データノード：データを保存したり、検索、集約、CRUDを行うんだ。                         |
| インジェスト          | node.ingest                                    | true   | データ保存前の前処理をするんだ。                                         |
| コーディネーティング    | 上記3つのパラメータが全てfalseだとコーディネーティングノードになるよ。 | なし     | 他のノードへリクエストをルーティングしたり、他のノードが処理した結果を結合してユーザーに返すんだ。       |

デフォルトだと、クラスターのどのノードも上記の4つの役割を同時に持ってるんだ。

でも、実際のクラスターではクラスターの役割を分ける必要があるんだ。

*   マスターノード：CPUの要求は高いけど、メモリの要求は低いよ。
*   データノード：CPUもメモリも要求が高いんだ。
*   コーディネーティングノード：ネットワーク帯域幅やCPUの要求が高いよ。

役割を分離することで、異なるノードの要求に合わせて異なるハードウェアを割り当ててデプロイできるんだ。それに、業務間の相互干渉も防げるよ。

## クラスターの脳裂問題

脳裂はクラスター内のノードが連絡を失うことで発生するんだ。

3つのノードがあると仮定して、マスターノード (node1) が他のノードと通信できなくなった（ネットワークが遮断された）とするね。node2とnode3はnode1がダウンしたと判断して、新しいマスターを選出し直すんだ。もしnode3が選出されたら、クラスターは外部にサービスを提供し続けるけど、node2とnode3は独自のクラスターになり、node1も独自のクラスターになってしまう。2つのクラスター間でデータが同期されず、データの差異が生じることになるんだ。

ネットワークの遮断が正常に戻ると、クラスター内にマスターノードが2つできてしまうから、クラスターの状態が不一致になり、脳裂状態が発生するんだ。

解決策：マスターノードに選出されるには、投票数が `(適格ノード数 + 1) / 2` を超える必要があるんだ。だから、適格ノード数は奇数であるのがベストだよ。対応する設定項目は `discovery.zen.minimum_master_nodes` で、ES 7.0以降ではこれがデフォルト設定になってるから、通常は脳裂問題は発生しないんだ。

例えば、上記の3つのノードで構成されたクラスターだと、投票数は (3+1)/2 = 2票を超える必要があるんだ。node3はnode2とnode3の投票を得てマスターに選出されるけど、node1は自分の一票しか得られないから選出されない。クラスター内には引き続き1つのマスターノードしか存在せず、脳裂は発生しないってわけだね。

## クラスターの分散ストレージ

新しいドキュメントを追加するときは、データが均等に分散されるように異なるシャードに保存するべきなんだけど、コーディネーティングノードはどうやってデータをどのシャードに保存するか決めるんだろうね？

ESはハッシュアルゴリズムを使って、ドキュメントがどのシャードに保存されるべきかを計算するんだ。

公式：shard = hash(_routing) % number_of_shards

説明：

*   `_routing` はデフォルトでドキュメントのIDなんだ。
*   アルゴリズムはシャード数に関係してるから、インデックスが一度作成されたらシャード数は変更できないんだ。

ドキュメント追加のフロー：

![image](https://raw.githubusercontent.com/yexca/picx-images-hosting/master/2024/01-SpringCloud/image-20210723225436084.5mtf1uqklgc0.webp)

フロー：

1.  IDが1のドキュメントを新規追加する。
2.  IDに対してハッシュ計算を行い、もし2が得られたらshard-2に対応して保存するんだ。
3.  shard-2のプライマリシャードはnode3ノードにあるから、データをnode3にルーティングするよ。
4.  ドキュメントを保存する。
5.  shard-2のレプリカreplica-2（node2ノードにある）に同期する。
6.  coordinating-nodeノードに結果を返す。

## クラスターの分散クエリ

ESのクエリは2つのフェーズに分かれているよ：

*   scatter phase：分散フェーズで、coordinating nodeがリクエストを各シャードに分配するんだ。
*   gather phase：集約フェーズで、coordinating nodeがデータノードの検索結果をまとめて、最終的な結果セットとしてユーザーに返すよ。

## クラスターのフェイルオーバー

クラスターのマスターノードはクラスター内のノードの状態を監視していて、もしノードがダウンしたのを見つけたら、すぐにダウンしたノードのシャードデータを他のノードに移行させて、データの安全を確保するんだ。これをフェイルオーバーと呼ぶよ。

クラスターに3つのノードがあって、node1がマスターノードだと仮定するね。

1.  node1がダウンしたとしよう。
2.  新しいマスターを選出し直す必要があるね。node2が選ばれたと仮定するよ。
3.  node2がマスターノードになったら、クラスターの状態をチェックして、node1のシャードにレプリカノードがないことに気づくんだ。それで、node1上のデータをnode2、node3に移行させる必要があるってことになるよ。
