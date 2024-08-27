(function () {
  'use strict';

  class configMgr {
      constructor() {
          (this.loadCfgList = [
              {
                  path: 'jsonConfig/LevelCfg.json',
                  tag: 'LevelCfg'
              },
              {
                  path: 'jsonConfig/levelData.json',
                  tag: 'levelData'
              },
              {
                  path: 'config/nickname.json',
                  tag: 'nickname'
              }
          ]),
              (this.skinCfg = []);
      }
      getLevelInfo() {
          return this.levelInfo;
      }
      getLevelData() {
          return this.levelData;
      }
      getNickInfo() {
          return this.nickname[Math.floor(Math.random() * this.nickname.length)];
      }
      init(e) {
          (this.glEvent = e),
              this.loadCfgList.forEach(e => {
                  this.loadJson(e);
              });
      }
      loadJson(e) {
          let t = this;
          Laya.loader.load(e.path, Laya.Handler.create(this, function (i) {
              t.onLoadJson(i, e.tag);
          }), null, Laya.Loader.JSON);
      }
      onLoadJson(e, t) {
          switch (t) {
              case 'LevelCfg':
                  this.levelData = e;
                  break;
              case 'levelData':
                  this.levelInfo = e.levelData;
                  break;
              case 'nickname':
                  this.nickname = e;
          }
          null != e &&
              this.glEvent.event('load_finish_event', {
                  target: t
              });
      }
      getSkinCfg() {
          return this.skinCfg;
      }
      getSkinByIndex(e) {
          return this.skinCfg[e];
      }
      getSkinIndexById(e) {
          for (let t = 0, i = this.skinCfg.length; t < i; ++t)
              if (e == this.skinCfg[t].id)
                  return t;
          return -1;
      }
  }

  class gameData {
      constructor() {
          (this.isStart = !1),
              (this.gameLevel = 1),
              (this.gameMgr = null),
              (this.gameCoin = 0),
              (this.rewardTime = -1),
              (this.gameCount = 0),
              (this.levelCount = 0),
              (this.gameState = 1),
              (this.noiseArr = []),
              (this.daojuArr = []),
              (this.endDis = 20),
              (this.propScene2Arr = []),
              (this.obstaclePlaneArr = []),
              (this.playName = []),
              (this.playerArr = []);
      }
  }

  class single extends Laya.Script {
      constructor() {
          super(), (this.index = -1);
      }
      init(e) {
          this.single = e;
      }
      clear() {
          Laya.timer.clearAll(this);
      }
      hidePeople(e) {
          'staticPeople' == this.single.name
              ? ((this.index = e), Laya.timer.once(3e3, this, this.lateRevivalPeople))
              : 'staticCoin' == this.single.name
                  ? ((this.index = e), Laya.timer.once(1e4, this, this.lateRevivalCoin))
                  : 'staticSpeed' == this.single.name
                      ? ((this.index = e), Laya.timer.once(1e4, this, this.lateRevivalSpeed))
                      : 'staticAdd' == this.single.name &&
                          ((this.index = e), Laya.timer.once(1e4, this, this.lateRevivalAdd));
      }
      lateRevivalPeople() {
          let e = M.gameMgr.aiPointLg.peopleArr, t = M.gameMgr.aiPointLg.data, i = M.gameMgr.aiPointLg.getRevivalPos(e[this.index].posi);
          i >= 0 &&
              ((e[this.index].isActive = !0),
                  (this.single.active = !0),
                  (this.single.transform.position = t[i].clone()),
                  (e[this.index].posi = i));
      }
      lateRevivalCoin() {
          let e = M.gameMgr.coinPointLg.coinArr, t = M.gameMgr.coinPointLg.data, i = M.gameMgr.coinPointLg.getRevivalPos(e[this.index].posi);
          i >= 0 &&
              ((e[this.index].isActive = !0),
                  (this.single.active = !0),
                  (this.single.transform.position = t[i].clone()),
                  (e[this.index].posi = i));
      }
      lateRevivalSpeed() {
          let e = M.gameMgr.speedLg.speedArr, t = M.gameMgr.speedLg.data, i = M.gameMgr.speedLg.getRevivalPos(e[this.index].posi);
          i >= 0 &&
              ((e[this.index].isActive = !0),
                  (this.single.active = !0),
                  (this.single.transform.position = t[i].clone()),
                  (e[this.index].posi = i));
      }
      lateRevivalAdd() {
          let e = M.gameMgr.addLg.addArr, t = M.gameMgr.addLg.data, i = M.gameMgr.addLg.getRevivalPos(e[this.index].posi);
          i >= 0 &&
              ((e[this.index].isActive = !0),
                  (this.single.active = !0),
                  (this.single.transform.position = t[i].clone()),
                  (e[this.index].posi = i));
      }
      onUpdate() {
          'staticCoin' == this.single.name &&
              (this.single.transform.localRotationEulerY -= (Laya.timer.delta / 1e3) * 120);
      }
  }

  class addRoot extends Laya.Script {
      constructor() {
          super(), (this.data = null), (this.indexArr = []), (this.dataArr = []), (this.addArr = []);
      }
      init(e) {
          (this.addRoot = e),
              (this.single = e.getChildAt(0)),
              this.single.addComponent(single),
              (this.single.active = !1),
              this.setPointData(),
              this.setStartData();
      }
      setPointData() {
          let e = M.configMgr.getLevelData()[M.gameMgr.randLevel].models, t = [];
          for (let i = 0; i < e.length; ++i)
              'daoju2_point' == e[i].name && t.push(new Laya.Vector3(e[i].pos.x, e[i].pos.y, e[i].pos.z));
          this.data = t;
      }
      setRandom() {
          for (let e = 0; e < this.data.length; ++e)
              (this.dataArr[e] = !1), (this.indexArr[e] = e);
          for (let e = 0; e < this.indexArr.length; ++e) {
              let t = Math.floor(Math.random() * (this.indexArr.length - e) + e), i = this.indexArr[t];
              (this.indexArr[t] = this.indexArr[e]), (this.indexArr[e] = i);
          }
      }
      setStartData() {
          this.setRandom();
          for (let e = 0; e < 5; ++e)
              (this.dataArr[this.indexArr[e]] = !0),
                  this.setAddAdd(this.data[this.indexArr[e]].clone(), this.indexArr[e]);
      }
      getRevivalPos(e) {
          let t = [];
          for (let e = 0; e < this.dataArr.length; ++e)
              this.dataArr[e] || t.push(e);
          if (((this.dataArr[e] = !1), t.length > 0)) {
              let e = Math.floor(Math.random() * t.length);
              return (this.dataArr[t[e]] = !0), t[e];
          }
          return -1;
      }
      reset() {
          for (let e = 0; e < this.addArr.length; ++e)
              (this.addArr[e].item.active = !1),
                  this.addArr[e].lg.clear(),
                  Laya.Pool.recover('staticAdd', this.addArr[e].item);
          (this.addArr = []), this.setStartData();
      }
      addAdd() {
          let e = Laya.Sprite3D.instantiate(this.single, this.addRoot);
          return (e.name = 'staticAdd'), e;
      }
      setAddAdd(e, t) {
          let i = Laya.Pool.getItem('staticAdd');
          i || (i = this.addAdd()),
              (i.active = !0),
              (i.transform.position = e.clone()),
              i.getComponent(single).init(i);
          let s = {
              item: i,
              isActive: !0,
              lg: i.getComponent(single),
              posi: t
          };
          this.addArr.push(s);
      }
  }

  class aiPointRoot extends Laya.Script {
      constructor() {
          super(), (this.data = null), (this.indexArr = []), (this.dataArr = []), (this.peopleArr = []);
      }
      init(e) {
          (this.aiRoot = e),
              (this.single = e.getChildAt(0)),
              this.single.addComponent(single),
              (this.single.active = !1),
              this.setPointData(),
              this.setStartData();
      }
      setPointData() {
          let e = M.configMgr.getLevelData()[M.gameMgr.randLevel].models, t = [];
          for (let i = 0; i < e.length; ++i)
              'people_point' == e[i].name && t.push(new Laya.Vector3(e[i].pos.x, e[i].pos.y, e[i].pos.z));
          this.data = t;
      }
      setRandom() {
          for (let e = 0; e < this.data.length; ++e)
              (this.dataArr[e] = !1), (this.indexArr[e] = e);
          for (let e = 0; e < this.indexArr.length; ++e) {
              let t = Math.floor(Math.random() * (this.indexArr.length - e) + e), i = this.indexArr[t];
              (this.indexArr[t] = this.indexArr[e]), (this.indexArr[e] = i);
          }
      }
      setStartData() {
          this.setRandom();
          for (let e = 0; e < 40; ++e)
              (this.dataArr[this.indexArr[e]] = !0),
                  this.setAddPeople(this.data[this.indexArr[e]].clone(), this.indexArr[e]);
      }
      getRevivalPos(e) {
          let t = [];
          for (let e = 0; e < this.dataArr.length; ++e)
              this.dataArr[e] || t.push(e);
          if (((this.dataArr[e] = !1), t.length > 0)) {
              let e = Math.floor(Math.random() * t.length);
              return (this.dataArr[t[e]] = !0), t[e];
          }
          return -1;
      }
      reset() {
          for (let e = 0; e < this.peopleArr.length; ++e)
              (this.peopleArr[e].item.active = !1),
                  this.peopleArr[e].lg.clear(),
                  Laya.Pool.recover('staticPeople', this.peopleArr[e].item);
          (this.peopleArr = []), this.setStartData();
      }
      addPeople() {
          let e = Laya.Sprite3D.instantiate(this.single, this.aiRoot);
          return (e.name = 'staticPeople'), e;
      }
      setAddPeople(e, t) {
          let i = Laya.Pool.getItem('staticPeople');
          i || (i = this.addPeople()),
              (i.active = !0),
              (i.transform.position = e.clone()),
              i.getComponent(single).init(i);
          let s = {
              item: i,
              isActive: !0,
              lg: i.getComponent(single),
              posi: t
          };
          this.peopleArr.push(s);
      }
  }

  class playerFormMgr extends Laya.Script {
      constructor() {
          super(),
              (this.formArr = []),
              (this.level = 0),
              (this.index = 0),
              (this.skinId = 0),
              (this.lastId = -1),
              (this.cubeCal = null),
              (this.formNameArr = ['Roller press', 'Tank', 'Helicopter', 'Master Vile']),
              (this.rolesArr = []),
              (this.lunArr = []),
              (this.xunArr = []),
              (this.addValue = 0),
              (this.bInvincible = !1),
              (this.formLevel = 0);
      }
      init(e, t) {
          (this.single = e), (this.index = t);
          for (let t = 0; t < e.numChildren; ++t)
              (this.formArr[t] = e.getChildAt(t)),
                  (this.formArr[t].getChildByName('cubeRoot').active = !1),
                  (this.formArr[t].active = !1);
          for (let e = 0; e < this.formArr.length; ++e)
              this.formArr[e].removeSelf();
          (this.formArr[0].active = !0), this.setLevelForm(0);
      }
      setSkinId(e) {
          (this.skinId = e), this.setLevelForm(this.level);
      }
      setLevelForm(e, t = !1) {
          this.level = e;
          let i = 0;
          if (((i = e < 30 ? e : e < 50 ? 30 : e < 100 ? 31 : e < 250 ? 32 : 33) > this.lastId &&
              0 == this.index &&
              M.soundMgr.play(11),
              i == this.lastId && i > 29))
              return;
          i > this.lastId &&
              i > 29 &&
              M.commonData.GGame.showChangeInfo(this.index, this.formNameArr[i - 30]),
              (this.lastId = i);
          for (let e = 0; e < this.formArr.length; ++e)
              (this.formArr[e].active = !1), this.formArr[e].parent && this.formArr[e].removeSelf();
          let s = this.formArr[i];
          this.addChild(s),
              (this.cubeCal = s.getChildByName('cubeRoot').getChildAt(0)),
              (this.rolesArr = []),
              (this.lunArr = []),
              (this.xunArr = []),
              this.getChild(s),
              0 == e &&
                  (t
                      ? s.getComponent(Laya.Animator).play('run')
                      : s.getComponent(Laya.Animator).play('idle'));
      }
      addChild(e) {
          this.single.addChild(e),
              (e.active = !0),
              (e.transform.localPosition = new Laya.Vector3(0, 0, 0));
          let t = 0;
          30 == this.lastId && (t = 180), (e.transform.localRotationEuler = new Laya.Vector3(0, t, 0));
      }
      getChild(e) {
          for (let t = 0; t < e.numChildren; ++t) {
              let i = e.getChildAt(t);
              if (i.name.startsWith('roles_'))
                  if ((this.rolesArr.push(i), i.parent.name.startsWith('lun')))
                      if (i._render.materials.length > 1) {
                          let e = [M.gameMgr.roleMatArr[0], M.gameMgr.roleMatArr[0]];
                          i._render.materials = e;
                      }
                      else
                          i._render.material = M.gameMgr.roleMatArr[0];
                  else if (i._render.materials.length > 1) {
                      let e = [M.gameMgr.roleMatArr[this.skinId + 1], M.gameMgr.roleMatArr[this.skinId + 1]];
                      i._render.materials = e;
                  }
                  else
                      i._render.material = M.gameMgr.roleMatArr[this.skinId + 1];
              i.name.startsWith('lun')
                  ? this.lunArr.push(i)
                  : i.name.startsWith('xun') && this.xunArr.push(i),
                  this.getChild(i);
          }
      }
      onUpdate() {
          for (let e = 0; e < this.lunArr.length; ++e)
              30 == this.lastId
                  ? (this.lunArr[e].transform.localRotationEulerX -= Laya.timer.delta / 3)
                  : (this.lunArr[e].transform.localRotationEulerX += Laya.timer.delta / 3);
          for (let e = 0; e < this.xunArr.length; ++e)
              this.xunArr[e].transform.localRotationEulerY += Laya.timer.delta / 3;
          if (this.bInvincible) {
              this.addValue += Laya.timer.delta / 60;
              let e = Math.sin(this.addValue);
              this.lastId > 0 && (this.formArr[this.lastId].active = !(e > 0));
          }
      }
      setBInvincible(e) {
          (this.bInvincible = e), e || (this.formArr[this.lastId].active = !0);
      }
  }

  class aiSp extends Laya.Script {
      constructor() {
          super(),
              (this.isMove = !1),
              (this.index = 0),
              (this.speed = 3),
              (this.score = 0),
              (this.roleSkin = 0),
              (this.revivalTime = 10),
              (this.baseSpeed = 3),
              (this.delta = 0),
              (this.addTime = 0),
              (this.randomTime = new Date().valueOf() + 3e3 * Math.random() + 2e3),
              (this.bInvincible = !1),
              (this.revivalCount = 0),
              (this.mapWidth = 23),
              (this.lastp = new Laya.Vector3(0, 0, 0)),
              (this.lastCheckTime = 0),
              (this.calculateCount = 0),
              (this.maxPeopleCount = 0),
              (this.peopleCount = 0),
              (this.addSpeed = 1),
              (this.bAddSpeed = !1),
              (this.aitime = 0),
              (this.toAiObj = null),
              (this.lastExplodeTime = 0),
              (this.hurtTime = 0),
              (this.timeCount = 0),
              (this.otherItem = null);
      }
      init(e, t = 0) {
          (this.index = t),
              (this.single = e),
              (this.playerFormMgr = this.single.addComponent(playerFormMgr)),
              this.playerFormMgr.init(this.single.getChildAt(0), this.index);
      }
      setSkin(e) {
          this.playerFormMgr.setSkinId(e), (this.roleSkin = e), this.setFirstPeople();
      }
      setFirstPeople() {
          switch (((this.revivalTime = 10), this.roleSkin)) {
              case 1:
                  this.peopleCount += 3;
                  break;
              case 2:
                  this.revivalTime -= 1;
                  break;
              case 3:
                  this.speed += 0.05 * this.baseSpeed;
                  break;
              case 4:
                  (this.peopleCount += 5), (this.speed += 0.05 * this.baseSpeed);
                  break;
              case 5:
                  this.peopleCount += 10;
                  break;
              case 6:
                  (this.peopleCount += 10), (this.speed += 0.05 * this.baseSpeed);
                  break;
              case 7:
                  (this.revivalTime -= 2), (this.speed += 0.05 * this.baseSpeed);
                  break;
              case 8:
                  (this.peopleCount += 10), (this.speed += 0.1 * this.baseSpeed);
                  break;
              case 9:
                  (this.peopleCount += 10), (this.revivalTime -= 2);
                  break;
              case 10:
                  (this.peopleCount += 15), (this.speed += 0.1 * this.baseSpeed);
                  break;
              case 11:
                  this.peopleCount += 30;
          }
      }
      getChild(e) {
          for (let t = 0; t < e.numChildren; ++t) {
              let i = e.getChildAt(t);
              this.getChild(i);
          }
      }
      setMove() {
          (this.isMove = !0),
              this.setFormLevel(),
              (this.bInvincible = !0),
              this.playerFormMgr.setBInvincible(!0),
              Laya.timer.once(5e3, this, () => {
                  this.playerFormMgr.setBInvincible(!1), (this.bInvincible = !1);
              });
      }
      gameOverSet() {
          Laya.timer.clearAll(this), (this.isMove = !1);
      }
      reset() {
          (this.bInvincible = !1),
              (this.revivalCount = 0),
              (this.timeCount = 0),
              (this.maxPeopleCount = 0),
              (this.bAddSpeed = !1),
              (this.addSpeed = 1),
              (this.otherItem = null),
              (this.peopleCount = 0),
              this.setFormLevel(),
              (this.single.active = !0);
      }
      onLateUpdate() {
          (this.delta = Laya.timer.delta),
              this.delta > 50 && (this.delta = 20),
              this.isMove && (this.playMove(), this.setRandomDirection());
      }
      setRandomDirection() {
          new Date().valueOf() > this.randomTime &&
              !this.toAiObj &&
              !this.otherItem &&
              ((this.randomTime = new Date().valueOf() + 3e3 * Math.random() + 4e3), this.rotateAngle());
      }
      getPeoplePos() {
          let e = M.gameMgr.aiPointLg.peopleArr, t = [];
          for (let i = 0; i < e.length; ++i)
              e[i].isActive && t.push(i);
          return t.length > 5 && e[t[Math.floor(Math.random() * t.length)]];
      }
      lateRevivalAi() {
          let e = M.gameData.playerArr, t = M.gameMgr.aiMgr.data, i = M.gameMgr.aiMgr.getRevivalPos(e[this.index].posi);
          i >= 0 &&
              ((e[this.index].isActive = !0),
                  (this.single.active = !0),
                  (this.isMove = !0),
                  (this.single.transform.position = t[i].clone()),
                  (e[this.index].posi = i),
                  (this.bInvincible = !0),
                  this.revivalCount++,
                  this.playerFormMgr.setBInvincible(!0),
                  Laya.timer.once(5e3, this, () => {
                      this.playerFormMgr.setBInvincible(!1), (this.bInvincible = !1);
                  }),
                  Math.random() < 0.2 ? (this.peopleCount = this.maxPeopleCount) : (this.peopleCount = 0),
                  this.setFormLevel(),
                  M.gameMgr.playerLg.showPlayerLg.bVideo &&
                      ((this.isMove = !1), (M.gameMgr.playerLg.showPlayerLg.stopArr[this.index] = !0)));
      }
      rotateAngle() {
          let e = {
              value: 0
          }, t = this.getPeoplePos();
          if (t) {
              let i = this.single.transform.position.clone(), s = t.item.transform.position.clone(), a = new Laya.Vector3();
              Laya.Vector3.lerp(s, i, 2, a);
              let o = this.single.transform.rotation.clone();
              (a.y = i.y), this.single.transform.lookAt(a, new Laya.Vector3(0, 1, 0), !1);
              let n = this.single.transform.rotation.clone();
              this.single.transform.rotation = o.clone();
              let r = Laya.Tween.to(e, {
                  value: 1
              }, 300, Laya.Ease.linearIn, new Laya.Handler(this, () => { }));
              r.update = new Laya.Handler(this, () => {
                  this.toAiObj && Laya.Tween.clear(r);
                  let t = new Laya.Quaternion();
                  Laya.Quaternion.slerp(o, n, e.value, t), (this.single.transform.rotation = t.clone());
              });
          }
          else {
              let t = 90 + 180 * Math.random(), i = 5 * t, s = Laya.Tween.to(e, {
                  value: 1
              }, i, Laya.Ease.linearIn, new Laya.Handler(this, () => { })), a = this.single.transform.localRotationEulerY;
              s.update = new Laya.Handler(this, () => {
                  this.toAiObj && Laya.Tween.clear(s),
                      (this.single.transform.localRotationEulerY = a + t * e.value);
              });
          }
      }
      setFormLevel() {
          this.peopleCount < 0 && (this.peopleCount = 0),
              this.playerFormMgr.setLevelForm(this.peopleCount, this.isMove),
              this.maxPeopleCount < this.peopleCount && (this.maxPeopleCount = this.peopleCount);
      }
      playMove() {
          let e = this.single.transform.position.clone();
          (this.lastp = e.clone()), this.setDirection();
          let t = new Laya.Vector3();
          this.single.transform.getForward(t), Laya.Vector3.normalize(t, t);
          let i = new Laya.Vector3();
          Laya.Vector3.scale(t, (-this.delta / 1e3) * this.speed, i),
              Laya.Vector3.add(e, i, i),
              i.x > this.mapWidth && (i.x = this.mapWidth),
              i.x < -this.mapWidth && (i.x = -this.mapWidth),
              i.z > this.mapWidth && (i.z = this.mapWidth),
              i.z < -this.mapWidth && (i.z = -this.mapWidth),
              (this.single.transform.position = i.clone()),
              this.bAddSpeed
                  ? this.addSpeed < 1.3 && (this.addSpeed += 0.05)
                  : this.addSpeed > 1 && (this.addSpeed -= 0.05),
              this.calculate(),
              this.checkAddPeople();
      }
      checkAddPeople() {
          let e = new Date().valueOf();
          if (e - this.lastCheckTime > 2e3) {
              this.lastCheckTime = e;
              let t = this.single.transform.position.clone(), i = M.gameMgr.playerLg.showPlayer.transform.position.clone(), s = t.x - i.x, a = t.z - i.z;
              if (s * s + a * a > 100) {
                  let e = 0, t = M.commonData.newLevel;
                  t > 1 && t < 11 ? (e = 1) : t > 10 && (e = 2), (this.peopleCount += e), this.setFormLevel();
              }
          }
      }
      setDirection() {
          if (this.otherItem && this.otherItem.active) {
              let e = this.otherItem.transform.position.clone(), t = this.single.transform.rotation.clone();
              (e.y = this.single.transform.position.y),
                  this.single.transform.lookAt(e, new Laya.Vector3(0, 1, 0), !1);
              let i = this.single.transform.rotation.clone();
              Laya.Quaternion.slerp(t, i, 0.2, i), (this.single.transform.rotation = i.clone());
          }
          else if (this.toAiObj && this.toAiObj.isActive) {
              let e = this.single.transform.position.clone(), t = this.toAiObj.item.transform.position.clone();
              Laya.Vector3.lerp(t, e, 2, t);
              let i = this.single.transform.rotation.clone();
              (t.y = e.y), this.single.transform.lookAt(t, new Laya.Vector3(0, 1, 0), !1);
              let s = this.single.transform.rotation.clone();
              Laya.Quaternion.slerp(i, s, 0.1, s), (this.single.transform.rotation = s.clone());
          }
          else
              this.toAiObj = null;
      }
      calculate() {
          this.calculateCount++,
              this.calculateMud(),
              this.calculateNail(),
              this.calculateTree(),
              this.calculateWall(),
              this.calculateCount % 2 == 0
                  ? (this.calculatePeople(), this.calculateCoin())
                  : (this.calculateSpeed(), this.calculateAdd(), this.calculateOtherAi());
      }
      calculatePeople() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.aiPointLg.peopleArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          for (let a = 0; a < t.length; ++a) {
              if (!t[a].isActive)
                  continue;
              let o = t[a].item.transform.position.clone();
              if (Math.abs(o.x - e.x) < i && Math.abs(o.z - e.z) < i && this.pointInBoxCube(o.clone(), s)) {
                  (t[a].isActive = !1),
                      this.peopleCount++,
                      (t[a].item.active = !1),
                      t[a].lg.hidePeople(a),
                      this.setFormLevel();
                  break;
              }
          }
      }
      calculateCoin() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.coinPointLg.coinArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          for (let a = 0; a < t.length; ++a) {
              if (!t[a].isActive)
                  continue;
              let o = t[a].item.transform.position.clone();
              Math.abs(o.x - e.x) < i &&
                  Math.abs(o.z - e.z) < i &&
                  this.pointInBoxCube(o.clone(), s) &&
                  ((t[a].isActive = !1), (t[a].item.active = !1), t[a].lg.hidePeople(a));
          }
      }
      calculateTree() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.treePointLg.treeArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          if (this.peopleCount < 6)
              for (let s = 0; s < t.length; ++s) {
                  if (!t[s].isActive)
                      continue;
                  let a = t[s].item, o = a.transform.position.clone();
                  Math.abs(o.x - e.x) < i &&
                      Math.abs(o.z - e.z) < i &&
                      this.pointInPolygon(e.clone(), this.lastp.clone(), a);
              }
          else
              for (let a = 0; a < t.length; ++a) {
                  if (!t[a].isActive)
                      continue;
                  let o = t[a].item, n = o.transform.position.clone();
                  if (Math.abs(n.x - e.x) < i && Math.abs(n.z - e.z) < i) {
                      let e = o.getChildByName('calCube');
                      (this.calculateBoxByBoxEx(s, e) || this.calculateBoxByBoxEx(e, s)) &&
                          ((t[a].isActive = !1),
                              t[a].lg.hidePeople(a),
                              (o.active = !1),
                              (this.peopleCount -= 5),
                              this.setFormLevel());
                  }
              }
      }
      calculateWall() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.wallPointLg.wallArr, i = 6 + 0.1 * this.peopleCount;
          i *= 2;
          let s = this.playerFormMgr.cubeCal;
          if (this.peopleCount < 6)
              for (let s = 0; s < t.length; ++s) {
                  if (!t[s].isActive)
                      continue;
                  let a = t[s].item, o = a.transform.position.clone();
                  Math.abs(o.x - e.x) < i &&
                      Math.abs(o.z - e.z) < i &&
                      this.pointInPolygon(e.clone(), this.lastp.clone(), a);
              }
          else
              for (let a = 0; a < t.length; ++a) {
                  if (!t[a].isActive)
                      continue;
                  let o = t[a].item, n = o.transform.position.clone();
                  if (Math.abs(n.x - e.x) < i && Math.abs(n.z - e.z) < i) {
                      let e = o.getChildByName('calCube');
                      (this.calculateBoxByBoxEx(s, e) || this.calculateBoxByBoxEx(e, s)) &&
                          ((t[a].isActive = !1),
                              t[a].lg.hidePeople(a),
                              (o.active = !1),
                              (this.peopleCount -= 5),
                              this.setFormLevel());
                  }
              }
      }
      calculateMud() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.mudLg.mudArr, i = 6 + 0.1 * this.peopleCount;
          for (let s = 0; s < t.length; ++s) {
              let a = t[s].item, o = a.transform.position.clone();
              Math.abs(o.x - e.x) < i &&
                  Math.abs(o.z - e.z) < i &&
                  this.pointInPolygon(e.clone(), this.lastp.clone(), a);
          }
      }
      calculateNail() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.nailLg.nailArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          if (this.peopleCount < 6)
              for (let s = 0; s < t.length; ++s) {
                  if (!t[s].isActive)
                      continue;
                  let a = t[s].item, o = a.transform.position.clone();
                  Math.abs(o.x - e.x) < i &&
                      Math.abs(o.z - e.z) < i &&
                      this.pointInPolygon(e.clone(), this.lastp.clone(), a);
              }
          else
              for (let a = 0; a < t.length; ++a) {
                  if (!t[a].isActive)
                      continue;
                  let o = t[a].item, n = o.transform.position.clone();
                  if (Math.abs(n.x - e.x) < i && Math.abs(n.z - e.z) < i) {
                      let e = o.getChildByName('calCube');
                      (this.calculateBoxByBoxEx(s, e) || this.calculateBoxByBoxEx(e, s)) &&
                          ((t[a].isActive = !1),
                              t[a].lg.hidePeople(a),
                              (o.active = !1),
                              (this.peopleCount -= 5),
                              this.setFormLevel());
                  }
              }
      }
      calculateSpeed() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.speedLg.speedArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          if (s)
              for (let a = 0; a < t.length; ++a)
                  if (t[a].isActive) {
                      let o = t[a].item.transform.position.clone();
                      Math.abs(o.x - e.x) < i &&
                          Math.abs(o.z - e.z) < i &&
                          M.utils.pointInBox(o, s) &&
                          ((t[a].isActive = !1),
                              (t[a].item.active = !1),
                              t[a].lg.hidePeople(a),
                              Laya.timer.clear(this, this.lateSetSpeed),
                              (this.bAddSpeed = !0),
                              Laya.timer.once(5e3, this, this.lateSetSpeed));
                  }
      }
      lateSetSpeed() {
          this.bAddSpeed = !1;
      }
      calculateAdd() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.addLg.addArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          for (let a = 0; a < t.length; ++a)
              if (t[a].isActive) {
                  let o = t[a].item.transform.position.clone();
                  Math.abs(o.x - e.x) < i &&
                      Math.abs(o.z - e.z) < i &&
                      M.utils.pointInBox(o, s) &&
                      ((t[a].isActive = !1),
                          (t[a].item.active = !1),
                          t[a].lg.hidePeople(a),
                          (this.peopleCount += 5),
                          this.setFormLevel());
              }
      }
      calculateOtherAi() {
          let e = this.single.transform.position.clone(), t = M.gameData.playerArr, i = 6 + 0.1 * this.peopleCount;
          i *= 2;
          let s = this.playerFormMgr.cubeCal;
          for (let a = this.index + 1; a < t.length; ++a)
              if (t[a].isActive) {
                  let o = t[a].item.transform.position.clone();
                  if (Math.abs(o.x - e.x) < i && Math.abs(o.z - e.z) < i) {
                      let e = t[a].lg.playerFormMgr.cubeCal;
                      (this.calculateBoxByBoxEx(s, e) || this.calculateBoxByBoxEx(e, s)) &&
                          (this.peopleCount > t[a].lg.peopleCount
                              ? t[a].lg.hurtValue(this, 2)
                              : this.peopleCount < t[a].lg.peopleCount && this.hurtValue(t[a].lg, 2));
                  }
              }
      }
      calculateAi() {
          if (((this.aitime += Laya.timer.delta), this.aitime < 300))
              return;
          if (((this.aitime = 0), this.toAiObj && ((this.toAiObj = null), Math.random() < 0.4)))
              return;
          let e = this.single.transform.position.clone(), t = M.gameData.playerArr;
          for (let i = 0; i < t.length; ++i)
              if (this.index != t[i].index && t[i].isActive && this.peopleCount > t[i].lg.peopleCount) {
                  let s = t[i].item.transform.position.clone();
                  if (Math.abs(s.x - e.x) < 5 && Math.abs(s.z - e.z) < 5) {
                      this.toAiObj = t[i];
                      break;
                  }
              }
      }
      addPeople(e) {
          (this.peopleCount += e), this.setFormLevel();
      }
      explodeHurt() {
          let e = new Date().valueOf();
          if (e - this.lastExplodeTime > 1e3) {
              this.lastExplodeTime = e;
              let t = Math.floor(this.peopleCount / 2);
              t < 5 && (t = 5), this.hurtValue(null, t, !0);
          }
      }
      hurtValue(e, t, i = !1) {
          if (!this.bInvincible) {
              if (i)
                  this.peopleCount -= t;
              else {
                  let i = new Date().valueOf();
                  i - this.hurtTime > 100 &&
                      ((this.hurtTime = i),
                          this.timeCount++,
                          e &&
                              (this.timeCount > 10 && ((this.timeCount = 0), M.soundMgr.play(3)),
                                  0 == e.index && M.gameMgr.playVibrate(!0)),
                          t > this.peopleCount + 1 && (t = this.peopleCount + 1),
                          (this.peopleCount -= t),
                          e.isMove &&
                              (e.addPeople(t),
                                  Laya.timer.clear(this, this.lateSetOther),
                                  (this.otherItem = e.single),
                                  Laya.timer.once(2e3, this, this.lateSetOther)));
              }
              this.peopleCount <= 0
                  ? ((this.isMove = !1),
                      (this.single.active = !1),
                      (M.gameData.playerArr[this.index].isActive = !1),
                      (M.gameData.playerArr[this.index].deadTime = M.commonData.GGame.gameTime),
                      this.revivalCount < 1 && Laya.timer.once(1e4, this, this.lateRevivalAi),
                      e && 0 == e.index && M.soundMgr.play(10),
                      e && M.commonData.GGame.killTip(e.index, this.index),
                      this.judgeVictroy())
                  : this.setFormLevel();
          }
      }
      lateSetOther() {
          this.otherItem = null;
      }
      judgeVictroy() {
          let e = M.gameData.playerArr, t = -1, i = 0;
          for (let s = 0; s < e.length; ++s)
              e[s].isActive && ((t = s), i++);
          1 == i &&
              (0 == t
                  ? M.gameMgr.gameEndSet(!0)
                  : (M.gameMgr.gameEndSet(!1),
                      M.gameMgr.playerLg.showPlayerLg.revivalPage &&
                          Laya.Scene.close('views/revivalView.scene')),
                  Laya.timer.clear(M.commonData.GGame, M.commonData.GGame.setGameTime));
      }
      pointInPolygon(e, t, i) {
          let s = [], a = [], o = 0;
          for (let n = 0; n < i.numChildren; ++n) {
              let r = i.getChildAt(n);
              if ('cubePoint' == r.name) {
                  let i = r.transform.position.clone();
                  Laya.Vector3.subtract(i, e, i),
                      (s[o] = i.clone()),
                      (i = r.transform.position.clone()),
                      Laya.Vector3.subtract(i, t, i),
                      (a[o] = i.clone()),
                      o++;
              }
          }
          let n = s.length, r = 0, l = [], h = [];
          for (let e = 0; e < n; ++e) {
              let t = s[e].clone(), i = s[(e + 1) % n].clone();
              t.x * i.z - t.z * i.x > 0 ? ((r += 1), (l[e] = 1)) : ((r -= 1), (l[e] = -1)),
                  (t = a[e].clone()),
                  (i = a[(e + 1) % n].clone()),
                  t.x * i.z - t.z * i.x > 0 ? (h[e] = 1) : (h[e] = -1);
          }
          if (r == n || r == -n) {
              for (let i = 0; i < n; ++i)
                  if (l[i] * h[i] < 0) {
                      let a = s[i].clone(), o = s[(i + 1) % n].clone(), r = s[i].clone(), l = s[i].clone();
                      if ((Laya.Vector3.add(a, e, a),
                          Laya.Vector3.add(o, e, o),
                          Math.max(a.x, o.x) < Math.min(t.x, e.x) ||
                              Math.min(a.x, o.x) > Math.max(t.x, e.x) ||
                              Math.max(a.z, o.z) < Math.min(t.z, e.z) ||
                              Math.min(a.z, o.z) > Math.max(t.z, e.z)))
                          continue;
                      Laya.Vector3.subtract(e, t, r),
                          Laya.Vector3.subtract(o, a, l),
                          Laya.Vector3.normalize(l, l);
                      let h = Laya.Vector3.dot(l, r);
                      return (Laya.Vector3.scale(l, h, l),
                          Laya.Vector3.add(t, l, t),
                          (t.y = e.y),
                          (this.single.transform.position = t.clone()),
                          !0);
                  }
              this.single.transform.position = t.clone();
          }
          return !1;
      }
      calculateBoxByBoxEx(e, t) {
          let i = e.transform.position.clone(), s = new Laya.Vector3(), a = new Laya.Vector3();
          e.transform.getForward(s),
              e.transform.getRight(a),
              Laya.Vector3.normalize(s, s),
              Laya.Vector3.normalize(a, a);
          let o = e.transform.localScale.clone(), n = new Laya.Vector3();
          Laya.Vector3.scale(o, 0.5, n);
          let r = new Laya.Vector3(), l = new Laya.Vector3();
          Laya.Vector3.scale(s, n.z, r), Laya.Vector3.scale(a, n.x, l);
          let h = [];
          for (let e = 0; e < 4; ++e)
              if (((h[e] = new Laya.Vector3(i.x, i.y, i.z)),
                  e > 1
                      ? ((h[e].x += r.x), (h[e].y += r.y), (h[e].z += r.z))
                      : ((h[e].x -= r.x), (h[e].y -= r.y), (h[e].z -= r.z)),
                  e % 2 == 1
                      ? ((h[e].x += l.x), (h[e].y += l.y), (h[e].z += l.z))
                      : ((h[e].x -= l.x), (h[e].y -= l.y), (h[e].z -= l.z)),
                  this.pointInBoxCube(h[e].clone(), t)))
                  return !0;
          return !1;
      }
      pointInBoxCube(e, t) {
          let i = t.transform.position.clone(), s = new Laya.Vector3(0, 0, 0);
          Laya.Vector3.subtract(e, i, s);
          let a = new Laya.Vector3(0, 0, 0);
          t.transform.getForward(a), Laya.Vector3.normalize(a.clone(), a);
          let o = Laya.Vector3.dot(a, s), n = new Laya.Vector3(0, 0, 0);
          t.transform.getRight(n), Laya.Vector3.normalize(n.clone(), n);
          let r = Laya.Vector3.dot(n, s), l = t.transform.localScale.clone();
          return Math.abs(r) < l.x / 2 && Math.abs(o) < l.z / 2;
      }
  }

  class aiRoot extends Laya.Script {
      constructor() {
          super(),
              (this.aiLgArr = []),
              (this.data = null),
              (this.indexArr = []),
              (this.dataArr = []),
              (this.aiCount = 7);
      }
      init(e) {
          (this.oriRoot = e),
              (this.aiSp = e.getChildAt(0)),
              (this.aiSp.active = !1),
              this.setPointData(),
              this.initAiData(),
              this.setAiInfo();
      }
      initAiData() {
          let e = M.configMgr.getLevelInfo(), t = M.commonData.newLevel - 1, i = e[(t %= 15)].levelInfo;
          for (let e = 0; e < this.aiCount; ++e)
              this.setAiSp(e, i[2 * e], i[2 * e + 1] - 1);
      }
      setAiSp(e, t, i) {
          let s = Laya.Sprite3D.instantiate(this.aiSp, this.oriRoot), a = s.addComponent(aiSp);
          a.init(s, e + 1);
          let o = {
              item: s,
              isActive: !1,
              index: e + 1,
              lg: a,
              posi: -1,
              deadTime: 0
          };
          (a.peopleCount = t), a.setSkin(i), (M.gameData.playerArr[o.index] = o);
      }
      setPointData() {
          let e = M.configMgr.getLevelData()[M.gameMgr.randLevel].models, t = [];
          for (let i = 0; i < e.length; ++i)
              'Ai_point' == e[i].name && t.push(new Laya.Vector3(e[i].pos.x, e[i].pos.y, e[i].pos.z));
          this.data = t;
      }
      setRandom() {
          for (let e = 0; e < this.data.length; ++e)
              (this.dataArr[e] = !1), (this.indexArr[e] = e);
          for (let e = 0; e < this.indexArr.length; ++e) {
              let t = Math.floor(Math.random() * (this.indexArr.length - e) + e), i = this.indexArr[t];
              (this.indexArr[t] = this.indexArr[e]), (this.indexArr[e] = i);
          }
      }
      setAiInfo() {
          this.setRandom();
          for (let e = 0; e < this.aiCount; ++e) {
              let t = M.gameData.playerArr[e + 1].item;
              (t.active = !0), (M.gameData.playerArr[e + 1].isActive = !0);
              let i = this.data[this.indexArr[e]].clone();
              (M.gameData.playerArr[e + 1].posi = this.indexArr[e]),
                  (t.transform.position = i.clone()),
                  (this.dataArr[this.indexArr[e]] = !0);
          }
      }
      getRevivalPos(e) {
          let t = [];
          for (let e = 0; e < this.dataArr.length; ++e)
              this.dataArr[e] || t.push(e);
          if (((this.dataArr[e] = !1), t.length > 0)) {
              let e = Math.floor(Math.random() * t.length);
              return (this.dataArr[t[e]] = !0), t[e];
          }
          return -1;
      }
      reset() {
          for (let e = 0; e < this.aiCount; ++e)
              M.gameData.playerArr[e + 1].lg.reset();
          this.setAiInfo();
      }
      gameOverSet() {
          for (let e = 0; e < this.aiCount; ++e)
              M.gameData.playerArr[e + 1].lg.gameOverSet();
      }
      pauseAi() {
          for (let e = 0; e < this.aiCount; ++e)
              M.gameData.playerArr[e + 1].isActive && (M.gameData.playerArr[e + 1].lg.isMove = !1);
      }
      pauseAiStart() {
          for (let e = 0; e < this.aiCount; ++e)
              M.gameData.playerArr[e + 1].isActive && (M.gameData.playerArr[e + 1].lg.isMove = !0);
      }
      startMove() {
          for (let e = 0; e < this.aiCount; ++e)
              M.gameData.playerArr[e + 1].lg.setMove(!0);
      }
      aiMoveStart() { }
  }

  class cameraLg extends Laya.Script {
      constructor() {
          super(),
              (this.isMove = !1),
              (this.oriAngle = null),
              (this.distance = null),
              (this.countArr = [1, 6, 11, 17, 21, 27, 33]),
              (this.posArr = [
                  5.9, -4.78, 7.51, -6.47, 8.5, -7.5, 10.9, -10, 12.75, -11.94, 15.18, -14.49, 19.58, -19.1
              ]),
              (this.lastPos = new Laya.Vector3(0, 5.9, -4.78)),
              (this.oriz = 1),
              (this.lastScale = 1),
              (this.arr = [5, -6, -13, 3, -5, 2, -8, 3]),
              (this.count = 0),
              (this.isShake = !1),
              (this.orisp = null),
              (this.bSetAni = !1);
      }
      init(e) {
          (this.single = e), (this.player = M.gameMgr.playerLg.showPlayer);
          let t = this.single.transform.position.clone();
          (this.single.transform.position = t.clone()),
              (this.distance = new Laya.Vector3(0, 0, 0)),
              (this.distance = t.clone()),
              Laya.Vector3.subtract(t, this.player.transform.position.clone(), this.distance),
              (this.orip = this.single.transform.position.clone()),
              (this.oriAngle = this.single.transform.rotation.clone());
      }
      setCameraData(e) {
          (this.isMove = e), e && (this.player = M.gameMgr.playerLg.showPlayer);
      }
      onUpdate() {
          if (this.isMove) {
              let e = this.single.transform.position.clone(), t = M.gameMgr.playerLg.showPlayer.transform.position.clone(), i = new Laya.Vector3(), s = this.distance.clone(), a = this.countArr.length, o = M.gameMgr.playerLg.showPlayerLg.playerFormMgr.lastId + 1;
              for (let e = 0; e < this.countArr.length; ++e)
                  if (o < this.countArr[e]) {
                      a = e;
                      break;
                  }
              let n = 1, r = new Laya.Vector3(0, this.posArr[2 * a - 2], this.posArr[2 * a - 1]), l = r.clone();
              a < this.countArr.length &&
                  ((n = (o - this.countArr[a - 1]) / (this.countArr[a] - this.countArr[a - 1])),
                      (l = new Laya.Vector3(0, this.posArr[2 * a], this.posArr[2 * a + 1]))),
                  Laya.Vector3.lerp(r, l, n, l),
                  Laya.Vector3.lerp(this.lastPos, l, 0.05, this.lastPos),
                  (s = this.lastPos.clone()),
                  Laya.Browser.onAndroid && Laya.Vector3.scale(s, 1.2, s),
                  Laya.Vector3.add(t, s, i),
                  Laya.Vector3.lerp(e, i, 0.5, i),
                  (this.single.transform.position = i.clone());
          }
      }
      onLateUpdate2() {
          if ((this.count++, this.isShake)) {
              let e = this.count % 8, t = 0.003 * this.arr[e], i = this.single.transform.localPosition.clone(), s = this.player.transform.position.clone(), a = new Laya.Vector3(0, 0, 0);
              Laya.Vector3.add(s, this.distance, a);
              let o = this.single.transform.position.clone();
              Laya.Vector3.lerp(o, a, 0.1, a), (i = a.clone());
              let n = new Laya.Vector3(0, 0, 0);
              if ((this.single.transform.getRight(n),
                  Laya.Vector3.normalize(n, n),
                  Laya.Vector3.scale(n, t, n),
                  Laya.Vector3.add(i, n, i),
                  (this.single.transform.position = i.clone()),
                  this.count > 20)) {
                  (this.isShake = !1), Laya.timer.clear(this, this.onLateUpdate2);
                  let e = this.player.transform.position.clone(), t = new Laya.Vector3(0, 0, 0);
                  Laya.Vector3.add(e, this.distance, t);
                  let i = this.single.transform.position.clone();
                  Laya.Vector3.lerp(i, t, 0.1, t), (this.single.transform.position = t.clone());
              }
          }
      }
      setShake(e, t = !1) {
          (e && this.isShake) ||
              (e &&
                  ((this.isShake = !0),
                      (this.count = 0),
                      (this.bSetAni = t),
                      (this.orisp = this.single.transform.localPosition.clone()),
                      Laya.timer.frameLoop(1, this, this.onLateUpdate2)));
      }
      reSet() {
          (this.oriz = 1),
              (this.isMove = !1),
              (this.player = M.gameMgr.playerLg.showPlayer),
              (this.lastPos = new Laya.Vector3(0, 5.9, -4.78)),
              (this.lastScale = 1),
              (this.single.transform.position = this.orip.clone()),
              (this.single.transform.rotation = this.oriAngle.clone());
      }
  }

  class coinPointRoot extends Laya.Script {
      constructor() {
          super(), (this.data = null), (this.indexArr = []), (this.dataArr = []), (this.coinArr = []);
      }
      init(e) {
          (this.coinRoot = e),
              (this.single = e.getChildAt(0)),
              this.single.addComponent(single),
              (this.single.active = !1),
              this.setPointData(),
              this.setStartData();
      }
      setPointData() {
          let e = M.configMgr.getLevelData()[M.gameMgr.randLevel].models, t = [];
          for (let i = 0; i < e.length; ++i)
              'coin_point' == e[i].name && t.push(new Laya.Vector3(e[i].pos.x, e[i].pos.y, e[i].pos.z));
          this.data = t;
      }
      setRandom() {
          for (let e = 0; e < this.data.length; ++e)
              (this.dataArr[e] = !1), (this.indexArr[e] = e);
          for (let e = 0; e < this.indexArr.length; ++e) {
              let t = Math.floor(Math.random() * (this.indexArr.length - e) + e), i = this.indexArr[t];
              (this.indexArr[t] = this.indexArr[e]), (this.indexArr[e] = i);
          }
      }
      setStartData() {
          this.setRandom();
          for (let e = 0; e < 10; ++e)
              (this.dataArr[this.indexArr[e]] = !0),
                  this.setAddCoin(this.data[this.indexArr[e]].clone(), this.indexArr[e]);
      }
      getRevivalPos(e) {
          let t = [];
          for (let e = 0; e < this.dataArr.length; ++e)
              this.dataArr[e] || t.push(e);
          if (((this.dataArr[e] = !1), t.length > 0)) {
              let e = Math.floor(Math.random() * t.length);
              return (this.dataArr[t[e]] = !0), t[e];
          }
          return -1;
      }
      reset() {
          for (let e = 0; e < this.coinArr.length; ++e)
              (this.coinArr[e].item.active = !1),
                  this.coinArr[e].lg.clear(),
                  Laya.Pool.recover('staticCoin', this.coinArr[e].item);
          (this.coinArr = []), this.setStartData();
      }
      addCoin() {
          let e = Laya.Sprite3D.instantiate(this.single, this.coinRoot);
          return (e.name = 'staticCoin'), e;
      }
      setAddCoin(e, t) {
          let i = Laya.Pool.getItem('staticCoin');
          i || (i = this.addCoin()),
              (i.active = !0),
              (i.transform.position = e.clone()),
              i.getComponent(single).init(i);
          let s = {
              item: i,
              isActive: !0,
              lg: i.getComponent(single),
              posi: t
          };
          this.coinArr.push(s);
      }
  }

  class D extends Laya.Material {
      constructor() {
          super(),
              (this._albedoColor = null),
              this.setShaderName('MultiplePassOutlineMaterial_2'),
              (this._albedoColor = new Laya.Vector4(1, 1, 1, 1)),
              this._shaderValues.setNumber(D.OUTLINEWIDTH, 0.01581197),
              this._shaderValues.setNumber(D.OUTLINELIGHTNESS, 1),
              this._shaderValues.setVector(D.OUTLINECOLOR, new Laya.Vector4(0, 0, 0, 0)),
              this._shaderValues.setVector(D.ALBEDOCOLOR, new Laya.Vector4(1, 1, 1, 1)),
              (this.renderMode = 0);
      }
      set height(e) {
          this._shaderValues.setNumber(D.HEIGHT, e);
      }
      get diffuseTexture() {
          return this._shaderValues.getTexture(D.DIFFUSETEXTURE);
      }
      set diffuseTexture(e) {
          this._shaderValues.setTexture(D.DIFFUSETEXTURE, e);
      }
      set marginalColor(e) {
          this._shaderValues.setVector(D.MARGINALCOLOR, e);
      }
      set marginalStrength(e) {
          this._shaderValues.setVector(D.MARGINALSTRENGTH, e);
      }
      set diffuseColor(e) {
          this._shaderValues.setVector(D.ALBEDOCOLOR, e);
      }
      set Alphass(e) {
          this._shaderValues.setVector(D.ALBEDOCOLOR, new Laya.Vector4(1, 1, 1, e));
      }
      set renderMode(e) {
          (this.renderQueue = Laya.Material.RENDERQUEUE_TRANSPARENT),
              (this.alphaTest = !0),
              (this.depthWrite = !0),
              (this.blend = Laya.RenderState.BLEND_ENABLE_ALL),
              (this.blendSrc = Laya.RenderState.BLENDPARAM_SRC_ALPHA),
              (this.blendDst = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA),
              (this.depthTest = Laya.RenderState.DEPTHTEST_LESS);
      }
      get albedoColor() {
          return this._albedoColor;
      }
      set albedoColor(e) {
          let t = this._shaderValues.getVector(D.ALBEDOCOLOR);
          (this._albedoColor = e), this._shaderValues.setVector(D.ALBEDOCOLOR, t);
      }
      get _ColorA() {
          return this._albedoColor.w;
      }
      set _ColorA(e) {
          (this._albedoColor.w = e), (this.albedoColor = this._albedoColor);
      }
      get albedoColorA() {
          return this._ColorA;
      }
      set albedoColorA(e) {
          this._ColorA = e;
      }
      get depthWrite() {
          return this._shaderValues.getBool(D.DEPTH_WRITE);
      }
      set depthWrite(e) {
          this._shaderValues.setBool(D.DEPTH_WRITE, e);
      }
      get cull() {
          return this._shaderValues.getInt(D.CULL);
      }
      set cull(e) {
          this._shaderValues.setInt(D.CULL, e);
      }
      get blend() {
          return this._shaderValues.getInt(D.BLEND);
      }
      set blend(e) {
          this._shaderValues.setInt(D.BLEND, e);
      }
      get blendSrc() {
          return this._shaderValues.getInt(D.BLEND_SRC);
      }
      set blendSrc(e) {
          this._shaderValues.setInt(D.BLEND_SRC, e);
      }
      get blendDst() {
          return this._shaderValues.getInt(D.BLEND_DST);
      }
      set blendDst(e) {
          this._shaderValues.setInt(D.BLEND_DST, e);
      }
      get depthTest() {
          return this._shaderValues.getInt(D.DEPTH_TEST);
      }
      set depthTest(e) {
          this._shaderValues.setInt(D.DEPTH_TEST, e);
      }
      static initShader() {
          var e = {
              a_Position: Laya.VertexMesh.MESH_POSITION0,
              a_Normal: Laya.VertexMesh.MESH_NORMAL0,
              a_Texcoord: Laya.VertexMesh.MESH_TEXTURECOORDINATE0,
              a_BoneWeights: Laya.VertexMesh.MESH_BLENDWEIGHT0,
              a_BoneIndices: Laya.VertexMesh.MESH_BLENDINDICES0
          }, t = {
              u_Bones: Laya.Shader3D.PERIOD_CUSTOM,
              u_CameraPos: Laya.Shader3D.PERIOD_CAMERA,
              u_MvpMatrix: Laya.Shader3D.PERIOD_SPRITE,
              u_DiffuseColor: Laya.Shader3D.PERIOD_MATERIAL,
              u_WorldMat: Laya.Shader3D.PERIOD_SPRITE,
              u_texture: Laya.Shader3D.PERIOD_MATERIAL,
              u_marginalColor: Laya.Shader3D.PERIOD_MATERIAL,
              u_marginalStrength: Laya.Shader3D.PERIOD_MATERIAL,
              'u_SunLight.color': Laya.Shader3D.PERIOD_SCENE,
              u_OutlineWidth: Laya.Shader3D.PERIOD_MATERIAL,
              u_OutlineColor: Laya.Shader3D.PERIOD_MATERIAL,
              u_OutlineLightness: Laya.Shader3D.PERIOD_MATERIAL,
              u_AlbedoTexture: Laya.Shader3D.PERIOD_MATERIAL,
              u_Time: Laya.Shader3D.PERIOD_SCENE,
              u_Height: Laya.Shader3D.PERIOD_MATERIAL
          };
          let i = {
              s_Cull: Laya.Shader3D.RENDER_STATE_CULL,
              s_Blend: Laya.Shader3D.RENDER_STATE_BLEND,
              s_BlendSrc: Laya.Shader3D.RENDER_STATE_BLEND_SRC,
              s_BlendDst: Laya.Shader3D.RENDER_STATE_BLEND_DST,
              s_DepthTest: Laya.Shader3D.RENDER_STATE_DEPTH_TEST,
              s_DepthWrite: Laya.Shader3D.RENDER_STATE_DEPTH_WRITE
          };
          var s = Laya.Shader3D.add('MultiplePassOutlineMaterial_2'), a = new Laya.SubShader(e, t);
          s.addSubShader(a);
          a.addShaderPass('\n     #include "Lighting.glsl";\n     attribute vec4 a_Position;\n     attribute vec2 a_Texcoord;\n     attribute vec3 a_Normal;\n     uniform mat4 u_MvpMatrix;\n     uniform mat4 u_WorldMat;\n     varying vec2 v_Texcoord;\n     varying vec3 v_Normal;\n     #ifdef BONE\n     attribute vec4 a_BoneIndices;\n     attribute vec4 a_BoneWeights;\n     const int c_MaxBoneCount = 24;\n     uniform mat4 u_Bones[c_MaxBoneCount];\n     #endif\n     #if defined(DIRECTIONLIGHT)\n     varying vec3 v_PositionWorld;\n     #endif\n     void main()\n     {\n     #ifdef BONE\n     mat4 skinTransform=mat4(0.0);\n     skinTransform += u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;\n     skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;\n     skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;\n     skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;\n     vec4 position = skinTransform * a_Position;\n     gl_Position=u_MvpMatrix * position;\n     mat3 worldMat=mat3(u_WorldMat * skinTransform);\n     #else\n     gl_Position=u_MvpMatrix * a_Position;\n     mat3 worldMat=mat3(u_WorldMat);\n     #endif\n     v_Texcoord=a_Texcoord;\n     v_Normal=worldMat*a_Normal;\n     #if defined(DIRECTIONLIGHT)\n     #ifdef BONE\n     v_PositionWorld=(u_WorldMat*position).xyz;\n     #else\n     v_PositionWorld=(u_WorldMat*a_Position).xyz;\n     #endif\n     #endif\n     gl_Position=remapGLPositionZ(gl_Position); \n     }', '\n     #ifdef FSHIGHPRECISION\n         precision highp float;\n     #else\n         precision mediump float;\n     #endif\n \n     #include "Lighting.glsl";\n     varying vec2 v_Texcoord;\n     uniform sampler2D u_texture;\n     uniform vec3 u_marginalColor;\n     uniform int u_marginalStrength;\n     varying vec3 v_Normal;\n     uniform vec4 u_DiffuseColor;\n\n     uniform float u_Height;\n     uniform float u_Time;\n     #if defined(DIRECTIONLIGHT)\n         uniform vec3 u_CameraPos;\n         varying vec3 v_PositionWorld;\n         uniform DirectionLight u_SunLight;\n     #endif\n     void main()\n     {\n         gl_FragColor=texture2D(u_texture,v_Texcoord);\n         vec3 normal=normalize(v_Normal);\n         vec3 toEyeDir = normalize(u_CameraPos-v_PositionWorld);\n         float Rim = 1.0 - max(0.0,dot(toEyeDir, normal));\n         vec3 lightColor = u_SunLight.color;\n \n         vec4 mainColor= u_DiffuseColor; //vec4(37.0/255.0,51.0/255.0,111.0/255.0,1.0); //u_DiffuseColor;\n        //  if(v_PositionWorld.y < 0.5)\n        //  {\n        //     mainColor= vec4(1.0,69.0/255.0,0.0,1.0);\n        //  }\n\n         vec3 lightDire = normalize(u_SunLight.direction);\n         float lsm = max(0.0,dot(-lightDire,normal));\n \n         vec3 anibent = vec3(136.0/255.0,164.0/255.0,250.0/255.0);\n         vec4 anibent1 = vec4(anibent,1.0) * mainColor;\n \n         vec3 u_marginalColor1 = vec3(1.0,1.0,1.0);\n         vec3 Emissive = 1.0 * mainColor.xyz * u_marginalColor1 * pow(Rim,2.0);  \n        //  gl_FragColor = texture2D(u_texture, v_Texcoord) + vec4(Emissive,1.0);\n         gl_FragColor =  vec4(Emissive,1.0);\n         gl_FragColor = gl_FragColor + vec4(lightColor,1.0) * mainColor * lsm + anibent1;\n\n         float height = u_Height + 0.025 * sin(v_PositionWorld.x*13.0 + u_Time*5.0);//+ 0.02 * sin((v_PositionWorld.x + v_PositionWorld.x +3.14)*15.0 + u_Time*15.0)\n        //  + 0.02 * sin((v_PositionWorld.x + v_PositionWorld.x +3.14)*0.55 + u_Time*3.0) + 0.013 * cos(v_PositionWorld.x*0.1 + u_Time*7.0);\n        //  abs(sin(u_Time*0.1)*1.22)\n         gl_FragColor.a = v_PositionWorld.y > height ? 0.0:1.0;\n     }', i, 'Forward');
      }
  }
  D.DIFFUSETEXTURE = Laya.Shader3D.propertyNameToID('u_texture');
  D.MARGINALCOLOR = Laya.Shader3D.propertyNameToID('u_marginalColor');
  D.MARGINALSTRENGTH = Laya.Shader3D.propertyNameToID('u_marginalStrength');
  D.ALBEDOTEXTURE = Laya.Shader3D.propertyNameToID('u_AlbedoTexture');
  D.OUTLINECOLOR = Laya.Shader3D.propertyNameToID('u_OutlineColor');
  D.OUTLINEWIDTH = Laya.Shader3D.propertyNameToID('u_OutlineWidth');
  D.OUTLINELIGHTNESS = Laya.Shader3D.propertyNameToID('u_OutlineLightness');
  D.HEIGHT = Laya.Shader3D.propertyNameToID('u_Height');
  D.ALBEDOCOLOR = Laya.Shader3D.propertyNameToID('u_DiffuseColor');
  D.CULL = Laya.Shader3D.propertyNameToID('s_Cull');
  D.BLEND = Laya.Shader3D.propertyNameToID('s_Blend');
  D.BLEND_SRC = Laya.Shader3D.propertyNameToID('s_BlendSrc');
  D.BLEND_DST = Laya.Shader3D.propertyNameToID('s_BlendDst');
  D.DEPTH_TEST = Laya.Shader3D.propertyNameToID('s_DepthTest');
  D.DEPTH_WRITE = Laya.Shader3D.propertyNameToID('s_DepthWrite');

  class effect extends Laya.Script {
      constructor() {
          super(), (this.type = 0), (this.name = ''), (this.isMove = !1), (this.delta = 20);
      }
      inti(e, t, i) {
          (this.single = e), (this.type = t), (this.name = i);
      }
      setLatatimeHide(e) {
          Laya.timer.once(e, this, this.lateHide);
      }
      lateHide() {
          (this.single.active = !1),
              this.single.parent != M.gameMgr.effectRoot && this.single.removeSelf(),
              Laya.Pool.recover(this.name, this.single);
      }
      clear() {
          (this.isMove = !1),
              (this.single.active = !1),
              this.single.parent != M.gameMgr.effectRoot && this.single.removeSelf(),
              Laya.Pool.recover(this.name, this.single);
      }
      onUpdate() {
          (this.delta = Laya.timer.delta), this.delta > 50 && (this.delta = 20);
      }
  }

  class effectMgr extends Laya.Script {
      constructor() {
          super(), (this.effectArr = []);
      }
      init(e) {
          this.root = e;
          for (let e = 0; e < this.root.numChildren; ++e) {
              let t = this.root.getChildAt(e);
              (t.active = !1), this.effectArr.push(t);
          }
          this.initPoolEffect();
      }
      initPoolEffect() {
          let e = this.effectArr.length;
          for (let t = 0; t < e; ++t)
              for (let e = 0; e < 3; ++e) {
                  let e = Laya.Sprite3D.instantiate(this.effectArr[t], this.root);
                  e.addComponent(effect).inti(e, t, 'effect' + t), Laya.Pool.recover('effect' + t, e);
              }
      }
      addEffect(e) {
          let t = Laya.Sprite3D.instantiate(this.effectArr[e], this.root);
          return t.addComponent(effect).inti(t, e, 'effect' + e), t;
      }
      playEffect(e, t, i = null) {
          let s = Laya.Pool.getItem('effect' + e);
          s || (s = this.addEffect(e)),
              i && i.addChild(s),
              (s.transform.position = t.clone()),
              (s.active = !1),
              (s.active = !0);
          s.getComponent(effect).setLatatimeHide(4500);
      }
      playEffect2(e, t, i = null) {
          let s = Laya.Pool.getItem('effect' + e);
          s || (s = this.addEffect(e)),
              i && i.addChild(s),
              (t.y += 1),
              (s.transform.localPosition = new Laya.Vector3(0, 1, 0)),
              (s.transform.localRotationEuler = new Laya.Vector3(0, 0, 0)),
              (s.active = !1),
              (s.active = !0);
          s.getComponent(effect).setLatatimeHide(5e3);
      }
  }

  class explode extends Laya.Script {
      constructor() {
          super(),
              (this.effArr = []),
              (this.mapWidth = 18),
              (this.bDrop = !1),
              (this.bCalculate = !1),
              (this.dropSpeed = 0);
      }
      init(e) {
          this.single = e;
          for (let t = 0; t < e.numChildren; ++t)
              (this.effArr[t] = e.getChildAt(t)), (this.effArr[t].active = !1);
      }
      showExplode(e) {
          ((e = M.gameMgr.playerLg.showPlayer.transform.position.clone()).y = 0.1),
              (e.x += 10 * Math.random() - 5),
              (e.z += 10 * Math.random() - 5),
              e.x < -this.mapWidth && (e.x = -this.mapWidth),
              e.x > this.mapWidth && (e.x = this.mapWidth),
              e.z < -this.mapWidth && (e.z = -this.mapWidth),
              e.z > this.mapWidth && (e.z = this.mapWidth),
              (this.single.transform.position = e.clone()),
              (this.effArr[3].transform.position = new Laya.Vector3(e.x, e.y + 20, e.z)),
              (this.effArr[0].active = !1),
              (this.effArr[0].active = !0),
              Laya.timer.once(3e3, this, this.setGuidedMissile);
      }
      setGuidedMissile() {
          (this.dropSpeed = 0),
              (this.bDrop = !0),
              (this.effArr[3].active = !0),
              Laya.timer.once(2e3, this, this.showEff);
      }
      showEff() {
          (this.effArr[0].active = !1),
              (this.effArr[1].active = !1),
              (this.effArr[1].active = !0),
              (this.effArr[2].active = !1),
              (this.effArr[2].active = !0),
              (this.bCalculate = !0),
              Laya.timer.once(500, this, this.lateSetCalculate),
              Laya.timer.once(4e3, this, this.clear);
      }
      lateSetCalculate() {
          this.bCalculate = !1;
      }
      clear() {
          Laya.timer.clearAll(this);
          for (let e = 0; e < 4; ++e)
              this.effArr[e].active = !1;
      }
      onUpdate() {
          if (this.bDrop) {
              let e = 1.5, t = Laya.timer.delta, i = this.effArr[3].transform.position.clone();
              (this.dropSpeed += ((this.mapWidth / e / e) * t) / 1e3),
                  (this.effArr[3].transform.position = new Laya.Vector3(i.x, i.y - (t / 1e3) * this.dropSpeed, i.z)),
                  i.y < -8 && (this.bDrop = !1);
          }
          this.bCalculate && this.calculateHurt();
      }
      calculateHurt() {
          let e = this.single.transform.position.clone(), t = M.gameData.playerArr;
          for (let i = 0; i < t.length; ++i)
              if (t[i].isActive) {
                  let s = t[i].item.transform.position.clone(), a = 8 + 0.1 * t[i].lg.peopleCount;
                  a *= 2;
                  let o = t[i].lg.playerFormMgr.cubeCal;
                  Math.abs(s.x - e.x) < a &&
                      Math.abs(s.z - e.z) < a &&
                      (this.pointInBoxCube(e.clone(), o) || this.calculateCircleByBoxEx(o, e.clone())) &&
                      t[i].lg.explodeHurt();
              }
      }
      calculateCircleByBoxEx(e, t) {
          let i = e.transform.position.clone(), s = new Laya.Vector3(), a = new Laya.Vector3();
          e.transform.getForward(s),
              e.transform.getRight(a),
              Laya.Vector3.normalize(s, s),
              Laya.Vector3.normalize(a, a);
          let o = e.transform.localScale.clone(), n = new Laya.Vector3();
          Laya.Vector3.scale(o, 0.5, n);
          let r = new Laya.Vector3(), l = new Laya.Vector3();
          Laya.Vector3.scale(s, n.z, r), Laya.Vector3.scale(a, n.x, l);
          let h = [];
          for (let e = 0; e < 4; ++e)
              (h[e] = new Laya.Vector3(i.x, i.y, i.z)),
                  e > 1
                      ? ((h[e].x += r.x), (h[e].y += r.y), (h[e].z += r.z))
                      : ((h[e].x -= r.x), (h[e].y -= r.y), (h[e].z -= r.z)),
                  e % 2 == 1
                      ? ((h[e].x += l.x), (h[e].y += l.y), (h[e].z += l.z))
                      : ((h[e].x -= l.x), (h[e].y -= l.y), (h[e].z -= l.z));
          for (let e = 0; e < 4; ++e) {
              let i = h[e].clone(), s = h[(e + 1) % 4].clone();
              if (this.PointToSegDist2(t.clone(), i.clone(), s.clone()) < 7)
                  return !0;
          }
          return !1;
      }
      pointInBoxCube(e, t) {
          let i = t.transform.position.clone(), s = new Laya.Vector3(0, 0, 0);
          Laya.Vector3.subtract(e, i, s);
          let a = new Laya.Vector3(0, 0, 0);
          t.transform.getForward(a), Laya.Vector3.normalize(a.clone(), a);
          let o = Laya.Vector3.dot(a, s), n = new Laya.Vector3(0, 0, 0);
          t.transform.getRight(n), Laya.Vector3.normalize(n.clone(), n);
          let r = Laya.Vector3.dot(n, s), l = t.transform.localScale.clone();
          return Math.abs(r) < l.x / 2 && Math.abs(o) < l.z / 2;
      }
      PointToSegDist2(e, t, i) {
          let s = 0;
          (e.y = 0), (t.y = 0), (i.y = 0);
          let a = new Laya.Vector3(), o = new Laya.Vector3(), n = new Laya.Vector3();
          Laya.Vector3.subtract(i, t, o), Laya.Vector3.subtract(e, t, a), Laya.Vector3.subtract(e, i, n);
          let r = Laya.Vector3.dot(a, o);
          if (r < 0)
              return (s = Laya.Vector3.scalarLength(a));
          let l = Laya.Vector3.scalarLengthSquared(o);
          if (r > l)
              return (s = Laya.Vector3.scalarLength(n));
          let h = r / l, c = new Laya.Vector3();
          return (Laya.Vector3.lerp(t, i, h, c), Laya.Vector3.subtract(e, c, c), Laya.Vector3.scalarLength(c));
      }
  }

  class groundScene extends Laya.Script {
      constructor() {
          super();
          (this.sceneArr = []), (this.moveRoot = null), (this.scenePropArr = []), (this.endDis = 0);
      }
      init(e) {
          this.sceneRoot = e;
          for (let e = 1; e < this.sceneRoot.numChildren; ++e) {
              let t = this.sceneRoot.getChildAt(e);
              for (let e = 0; e < t.numChildren; ++e) {
                  let i = t.getChildAt(e), s = new Laya.Vector3();
                  i.transform.getUp(s);
              }
          }
      }
      resetData() {
          for (let e = 0; e < this.scenePropArr.length; ++e)
              (this.scenePropArr[e].item.active = !1),
                  Laya.Pool.recover(this.scenePropArr[e].item.name, this.scenePropArr[e].item);
          this.scenePropArr = [];
      }
      reset() { }
      addDaoju(e) {
          let t = this.sceneArr[e], i = Laya.Sprite3D.instantiate(t, this.sceneRoot);
          return (i.name = t.name), i;
      }
      getconfigData() {
          let e = M.configMgr.getLevelData(), t = M.commonData.newLevel - 1;
          (t %= 10), M.commonData.newLevel > 9 && t < 5 && (t += 5);
          let i = e[t].models;
          for (let e = 0; e < i.length; ++e) {
              let t = i[e];
              if (t.name.startsWith('road_0')) {
                  let e = Laya.Pool.getItem(t.name), i = t.name, s = parseInt(i.substring(6));
                  e || (e = this.addDaoju(s - 1)), (e.active = !0);
                  let a = new Laya.Vector3(t.pos.x, t.pos.y, t.pos.z), o = new Laya.Vector3(t.scale.x, t.scale.y, t.scale.z);
                  (e.transform.position = a.clone()),
                      (e.transform.localScale = o.clone()),
                      (e.transform.localRotationEulerY = t.r);
              }
          }
      }
  }

  class mudRoot extends Laya.Script {
      constructor() {
          super(), (this.mudArr = []);
      }
      init(e) {
          (this.mudRoot = e),
              (this.single = e.getChildAt(0)),
              this.single.addComponent(single),
              (this.single.active = !1),
              this.setPointData();
      }
      setPointData() {
          let e = M.configMgr.getLevelData()[M.gameMgr.randLevel].models;
          for (let t = 0; t < e.length; ++t)
              if ('mud_point' == e[t].name) {
                  let i = new Laya.Vector3(e[t].pos.x, e[t].pos.y, e[t].pos.z);
                  this.setAddMud(i.clone(), e[t].r);
              }
      }
      reset() {
          for (let e = 0; e < this.mudArr.length; ++e)
              (this.mudArr[e].item.active = !1),
                  this.mudArr[e].lg.clear(),
                  Laya.Pool.recover('staticMud', this.mudArr[e].item);
          (this.mudArr = []), this.setPointData();
      }
      addMud() {
          let e = Laya.Sprite3D.instantiate(this.single, this.mudRoot);
          return (e.name = 'staticMud'), e;
      }
      setAddMud(e, t) {
          let i = Laya.Pool.getItem('staticMud');
          i || (i = this.addMud()),
              (i.active = !0),
              (i.transform.position = e.clone()),
              i.getComponent(single).init(i);
          let s = {
              item: i,
              isActive: !0,
              lg: i.getComponent(single)
          };
          (i.transform.localRotationEulerY = t), this.mudArr.push(s);
      }
  }

  class nailRoots extends Laya.Script {
      constructor() {
          super(), (this.nailArr = []);
      }
      init(e) {
          (this.nailRoot = e),
              (this.single = e.getChildAt(0)),
              this.single.addComponent(single),
              (this.single.active = !1),
              this.setPointData();
      }
      setPointData() {
          let e = M.configMgr.getLevelData()[M.gameMgr.randLevel].models;
          for (let t = 0; t < e.length; ++t)
              if ('nail_point' == e[t].name) {
                  let i = new Laya.Vector3(e[t].pos.x, e[t].pos.y, e[t].pos.z);
                  this.setAddNail(i.clone(), e[t].r);
              }
      }
      reset() {
          for (let e = 0; e < this.nailArr.length; ++e)
              (this.nailArr[e].item.active = !1),
                  this.nailArr[e].lg.clear(),
                  Laya.Pool.recover('staticNail', this.nailArr[e].item);
          (this.nailArr = []), this.setPointData();
      }
      addNail() {
          let e = Laya.Sprite3D.instantiate(this.single, this.nailRoot);
          return (e.name = 'staticNail'), e;
      }
      setAddNail(e, t) {
          let i = Laya.Pool.getItem('staticNail');
          i || (i = this.addNail()),
              (i.active = !0),
              (i.transform.position = e.clone()),
              i.getComponent(single).init(i);
          let s = {
              item: i,
              isActive: !0,
              lg: i.getComponent(single)
          };
          (i.transform.localRotationEulerY = t), this.nailArr.push(s);
      }
  }

  class props extends Laya.Script {
      constructor() {
          super(),
              (this.type = 0),
              (this.isMove = !1),
              (this.oriy = 0),
              (this.moveTime = 0),
              (this.aniState = 0),
              (this.delta = 20);
      }
      init(e, t) {
          (this.single = e), (this.type = t), (this.isMove = !0);
      }
      clear() {
          (this.aniState = 0),
              (this.single.active = !1),
              (this.isMove = !1),
              Laya.timer.clearAll(this),
              Laya.Tween.clearAll(this);
      }
      playAnimation(e) {
          if (e != this.aniState && this.animation)
              switch (((this.aniState = e), e)) {
                  case 1:
                      this.animation.crossFade('npcidle1', 0.1, 0);
                      break;
                  case 2:
                      this.animation.crossFade('playsweime', 0.1, 0);
                      break;
                  case 3:
                      this.animation.crossFade('npcdie1', 0.1, 0);
                      break;
                  case 4:
                      this.animation.crossFade('npcdie2', 0.1, 0);
              }
      }
      onLateUpdate() {
          (this.delta = Laya.timer.delta), this.delta > 50 && (this.delta = 20);
      }
  }

  class obstacle extends Laya.Script {
      constructor() {
          super(),
              (this.isMove = !1),
              (this.daojuArr = []),
              (this.obstacleType = 0),
              (this.scenePropArr = []);
      }
      init(e) {
          (this.root = e), (e.active = !0);
      }
      addDaoju(e) {
          let t = this.daojuArr[e], i = Laya.Sprite3D.instantiate(t, this.daojuRoot);
          return (i.name = t.name), i;
      }
      obstacleReset() { }
      getconfigData() {
          let e = M.configMgr.getLevelData(), t = M.commonData.newLevel - 1;
          (t %= 10), M.commonData.newLevel > 9 && t < 5 && (t += 5);
          let i = e[t].models;
          for (let e = 0; e < i.length; ++e) {
              let t = i[e];
              if (t.name.startsWith('prop')) {
                  let e = Laya.Pool.getItem(t.name), i = t.name, s = parseInt(i.substring(4));
                  e || (e = this.addDaoju(s - 1)), (e.active = !0);
                  let a = new Laya.Vector3(t.pos.x, t.pos.y, t.pos.z), o = new Laya.Vector3(t.scale.x, t.scale.y, t.scale.z);
                  (e.transform.position = a.clone()),
                      (e.transform.localScale = o.clone()),
                      (e.transform.localRotationEulerY = t.r);
                  let n = e.getComponent(props);
                  n.init(e, s);
                  let r = {
                      item: e,
                      lg: n,
                      type: s,
                      scale: o.clone(),
                      isActive: !0
                  };
                  this.scenePropArr.push(r);
              }
          }
      }
      resetData() {
          let e = this.scenePropArr;
          for (let t = 0; t < e.length; ++t)
              e[t].lg.clear(), Laya.Pool.recover(e[t].item.name, e[t].item);
          this.scenePropArr = [];
      }
      onUpdate() { }
  }

  class showPlayerLg extends Laya.Script {
      constructor() {
          super(),
              (this.isMove = !1),
              (this.isShow = !1),
              (this.index = 0),
              (this.skinArr = []),
              (this.speed = 3),
              (this.roleSkin = 0),
              (this.revivalTime = 10),
              (this.baseSpeed = 3),
              (this.oriPos = null),
              (this.oriAngle = null),
              (this.delta = 20),
              (this.addTime = 0),
              (this.playTime = 0),
              (this.maxPeople = 0),
              (this.mapWidth = 23),
              (this.lastp = new Laya.Vector3()),
              (this.calculateCount = 0),
              (this.peopleCount = 0),
              (this.addCount = 0),
              (this.addSpeed = 1),
              (this.bAddSpeed = !1),
              (this.lastExplodeTime = 0),
              (this.revivalCount = 0),
              (this.bInvincible = !1),
              (this.hurtTime = 0),
              (this.revivalPage = null),
              (this.bVideo = !1),
              (this.stopArr = []);
      }
      init(e, t) {
          (this.single = e),
              (this.isShow = t),
              (this.single.transform.localRotationEulerX = 0),
              this.setFirstPeople(),
              (this.playerFormMgr = this.single.addComponent(playerFormMgr)),
              this.playerFormMgr.init(this.single.getChildAt(0), 0),
              (this.oriPos = this.single.transform.position.clone()),
              (this.oriAngle = this.single.transform.rotation.clone()),
              this.setFormLevel();
      }
      setMove(e) {
          (this.isMove = e), this.setFormLevel(), this.setFirstPeople();
          let t = M.configMgr.getLevelInfo();
          M.gameData.playerArr[0].isActive = !0;
          let i = M.commonData.newLevel - 1, s = t[(i %= 15)].levelInfo;
          Laya.timer.loop(1e4 + 1e3 * s[14], this, this.showexplode),
              (this.bInvincible = !0),
              this.playerFormMgr.setBInvincible(!0),
              Laya.timer.once(5e3, this, () => {
                  (this.bInvincible = !1), this.playerFormMgr.setBInvincible(!1);
              });
      }
      showexplode() {
          M.gameMgr.explodeMgr.showExplode(this.single.transform.position.clone());
      }
      setSkin(e) {
          this.playerFormMgr.setSkinId(e), (this.roleSkin = e), this.setFirstPeople();
      }
      setFirstPeople() {
          let e = M.storageMgr.getHomeHitLevel();
          (this.peopleCount = e[1] - 1), this.peopleCount > 20 && (this.peopleCount = 20);
          let t = e[0];
          t > 21 && (t = 21), (this.speed = this.baseSpeed * (0.01 * (t - 1) + 1));
          let i = e[2];
          switch ((i > 21 && (i = 21), (this.revivalTime = 10 - 0.1 * (i - 1)), this.roleSkin)) {
              case 1:
                  this.peopleCount += 3;
                  break;
              case 2:
                  this.revivalTime -= 1;
                  break;
              case 3:
                  this.speed += 0.05 * this.baseSpeed;
                  break;
              case 4:
                  (this.peopleCount += 5), (this.speed += 0.05 * this.baseSpeed);
                  break;
              case 5:
                  this.peopleCount += 10;
                  break;
              case 6:
                  (this.peopleCount += 10), (this.speed += 0.05 * this.baseSpeed);
                  break;
              case 7:
                  (this.revivalTime -= 2), (this.speed += 0.05 * this.baseSpeed);
                  break;
              case 8:
                  (this.peopleCount += 10), (this.speed += 0.1 * this.baseSpeed);
                  break;
              case 9:
                  (this.peopleCount += 10), (this.revivalTime -= 2);
                  break;
              case 10:
                  (this.peopleCount += 15), (this.speed += 0.1 * this.baseSpeed);
                  break;
              case 11:
                  this.peopleCount += 30;
          }
      }
      reset() {
          Laya.timer.clearAll(this),
              this.setFirstPeople(),
              this.setFormLevel(),
              (this.bAddSpeed = !1),
              (this.addSpeed = 1),
              (this.revivalCount = 0),
              (this.bInvincible = !1),
              (this.maxPeople = 0),
              (this.single.active = !0),
              (this.single.transform.position = this.oriPos.clone()),
              (this.single.transform.rotation = this.oriAngle.clone());
      }
      setPlayerMove(e, t) {
          if (!this.isMove)
              return;
          let i = this.single.transform.position.clone(), s = new Laya.Vector3(i.x + e, i.y, i.z + t);
          this.single.transform.lookAt(s, new Laya.Vector3(0, 1, 0), !1);
      }
      onUpdate() {
          Laya.timer.delta > 500 ||
              0 == Laya.timer.scale ||
              ((this.delta = Laya.timer.delta),
                  this.delta > 50 && (this.delta = 20),
                  (this.delta = 20),
                  this.isMove && this.playMove());
      }
      setFormLevel() {
          this.playerFormMgr.setLevelForm(this.peopleCount, this.isMove);
          let e = M.storageMgr.getMaxPeople();
          e < this.peopleCount && M.storageMgr.setMaxPeople(this.peopleCount),
              e > this.maxPeople && (this.maxPeople = e);
      }
      playMove() {
          this.lastp = this.single.transform.position.clone();
          let e = new Laya.Vector3();
          this.single.transform.getForward(e), Laya.Vector3.normalize(e, e);
          let t = this.single.transform.position.clone(), i = new Laya.Vector3();
          Laya.Vector3.scale(e, (-this.delta / 1e3) * this.speed * this.addSpeed, i),
              Laya.Vector3.add(t, i, i),
              i.x > this.mapWidth && (i.x = this.mapWidth),
              i.x < -this.mapWidth && (i.x = -this.mapWidth),
              i.z > this.mapWidth && (i.z = this.mapWidth),
              i.z < -this.mapWidth && (i.z = -this.mapWidth),
              (this.single.transform.position = i.clone()),
              this.bAddSpeed
                  ? this.addSpeed < 1.5 && (this.addSpeed += 0.05)
                  : this.addSpeed > 1 && (this.addSpeed -= 0.05),
              this.calculate();
      }
      calculate() {
          this.calculateCount++,
              this.calculateMud(),
              this.calculateNail(),
              this.calculateTree(),
              this.calculateWall(),
              this.calculateCount % 2 == 0
                  ? (this.calculatePeople(), this.calculateCoin())
                  : (this.calculateSpeed(), this.calculateAdd(), this.calculateOtherAi());
      }
      playEffect(e, t, i = null) {
          M.gameMgr.effectMgr.playEffect(e, t.clone(), i);
      }
      calculatePeople() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.aiPointLg.peopleArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          for (let a = 0; a < t.length; ++a) {
              if (!t[a].isActive)
                  continue;
              let o = t[a].item.transform.position.clone();
              if (Math.abs(o.x - e.x) < i && Math.abs(o.z - e.z) < i && this.pointInBoxCube(o.clone(), s)) {
                  (t[a].isActive = !1),
                      this.peopleCount++,
                      (t[a].item.active = !1),
                      t[a].lg.hidePeople(a),
                      this.setFormLevel(),
                      (o.y += 0.3),
                      this.playEffect(0, o.clone()),
                      M.gameMgr.playVibrate(!0),
                      M.commonData.GGame.showAddUi2('+1'),
                      M.soundMgr.play(4);
                  platform.vibrateShort(200);
                  break;
              }
          }
      }
      calculateCoin() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.coinPointLg.coinArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          for (let a = 0; a < t.length; ++a) {
              if (!t[a].isActive)
                  continue;
              let o = t[a].item.transform.position.clone();
              Math.abs(o.x - e.x) < i &&
                  Math.abs(o.z - e.z) < i &&
                  this.pointInBoxCube(o.clone(), s) &&
                  ((t[a].isActive = !1),
                      (t[a].item.active = !1),
                      t[a].lg.hidePeople(a),
                      M.gameMgr.playVibrate(!0),
                      (this.addCount = 0),
                      Laya.timer.loop(50, this, this.showAddUi));
          }
      }
      showAddUi() {
          this.addCount++, this.addCount > 4 && Laya.timer.clear(this, this.showAddUi);
          let e = this.single.transform.position.clone();
          M.commonData.GGame.showAddUi(e.clone(), 40);
      }
      calculateTree() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.treePointLg.treeArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          if (this.peopleCount < 6)
              for (let s = 0; s < t.length; ++s) {
                  if (!t[s].isActive)
                      continue;
                  let a = t[s].item, o = a.transform.position.clone();
                  Math.abs(o.x - e.x) < i &&
                      Math.abs(o.z - e.z) < i &&
                      this.pointInPolygon(e.clone(), this.lastp.clone(), a);
              }
          else
              for (let a = 0; a < t.length; ++a) {
                  if (!t[a].isActive)
                      continue;
                  let o = t[a].item, n = o.transform.position.clone();
                  if (Math.abs(n.x - e.x) < i && Math.abs(n.z - e.z) < i) {
                      let e = o.getChildByName('calCube');
                      (this.calculateBoxByBoxEx(s, e) || this.calculateBoxByBoxEx(e, s)) &&
                          ((t[a].isActive = !1),
                              t[a].lg.hidePeople(a),
                              (o.active = !1),
                              (this.peopleCount -= 5),
                              this.setFormLevel(),
                              M.gameMgr.playVibrate(!1),
                              M.soundMgr.play(6),
                              (n.y += 1),
                              this.playEffect(2, n.clone()));
                  }
              }
      }
      calculateWall() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.wallPointLg.wallArr, i = 6 + 0.1 * this.peopleCount;
          i *= 2;
          let s = this.playerFormMgr.cubeCal;
          if (this.peopleCount < 6)
              for (let s = 0; s < t.length; ++s) {
                  if (!t[s].isActive)
                      continue;
                  let a = t[s].item, o = a.transform.position.clone();
                  Math.abs(o.x - e.x) < i &&
                      Math.abs(o.z - e.z) < i &&
                      this.pointInPolygon(e.clone(), this.lastp.clone(), a);
              }
          else
              for (let a = 0; a < t.length; ++a) {
                  if (!t[a].isActive)
                      continue;
                  let o = t[a].item, n = o.transform.position.clone();
                  if (Math.abs(n.x - e.x) < i && Math.abs(n.z - e.z) < i) {
                      let e = o.getChildByName('calCube');
                      (this.calculateBoxByBoxEx(s, e) || this.calculateBoxByBoxEx(e, s)) &&
                          ((t[a].isActive = !1),
                              t[a].lg.hidePeople(a),
                              (o.active = !1),
                              (this.peopleCount -= 5),
                              this.setFormLevel(),
                              M.gameMgr.playVibrate(!1),
                              M.soundMgr.play(3),
                              (n.y += 0.8),
                              this.playEffect(1, n.clone()));
                  }
              }
      }
      calculateMud() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.mudLg.mudArr, i = 6 + 0.1 * this.peopleCount;
          for (let s = 0; s < t.length; ++s) {
              let a = t[s].item, o = a.transform.position.clone();
              Math.abs(o.x - e.x) < i &&
                  Math.abs(o.z - e.z) < i &&
                  this.pointInPolygon(e.clone(), this.lastp.clone(), a);
          }
      }
      calculateNail() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.nailLg.nailArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          if (this.peopleCount < 6)
              for (let s = 0; s < t.length; ++s) {
                  if (!t[s].isActive)
                      continue;
                  let a = t[s].item, o = a.transform.position.clone();
                  Math.abs(o.x - e.x) < i &&
                      Math.abs(o.z - e.z) < i &&
                      this.pointInPolygon(e.clone(), this.lastp.clone(), a);
              }
          else
              for (let a = 0; a < t.length; ++a) {
                  if (!t[a].isActive)
                      continue;
                  let o = t[a].item, n = o.transform.position.clone();
                  if (Math.abs(n.x - e.x) < i && Math.abs(n.z - e.z) < i) {
                      let e = o.getChildByName('calCube');
                      (this.calculateBoxByBoxEx(s, e) || this.calculateBoxByBoxEx(e, s)) &&
                          ((t[a].isActive = !1),
                              t[a].lg.hidePeople(a),
                              (o.active = !1),
                              (this.peopleCount -= 5),
                              this.setFormLevel(),
                              M.gameMgr.playVibrate(!1),
                              M.soundMgr.play(3),
                              (n.y += 0.3),
                              this.playEffect(3, n.clone()));
                  }
              }
      }
      calculateSpeed() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.speedLg.speedArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          if (s)
              for (let a = 0; a < t.length; ++a)
                  if (t[a].isActive) {
                      let o = t[a].item.transform.position.clone();
                      Math.abs(o.x - e.x) < i &&
                          Math.abs(o.z - e.z) < i &&
                          M.utils.pointInBox(o, s) &&
                          ((t[a].isActive = !1),
                              (t[a].item.active = !1),
                              t[a].lg.hidePeople(a),
                              Laya.timer.clear(this, this.lateSetSpeed),
                              (this.bAddSpeed = !0),
                              Laya.timer.once(5e3, this, this.lateSetSpeed),
                              M.gameMgr.playVibrate(!0),
                              M.soundMgr.play(5),
                              M.commonData.GGame.showTipInfo('Speed +30%', 2000));
                  }
      }
      lateSetSpeed() {
          this.bAddSpeed = !1;
      }
      calculateAdd() {
          let e = this.single.transform.position.clone(), t = M.gameMgr.addLg.addArr, i = 6 + 0.1 * this.peopleCount, s = this.playerFormMgr.cubeCal;
          for (let a = 0; a < t.length; ++a)
              if (t[a].isActive) {
                  let o = t[a].item.transform.position.clone();
                  Math.abs(o.x - e.x) < i &&
                      Math.abs(o.z - e.z) < i &&
                      M.utils.pointInBox(o, s) &&
                      ((t[a].isActive = !1),
                          (t[a].item.active = !1),
                          t[a].lg.hidePeople(a),
                          (this.peopleCount += 5),
                          this.setFormLevel(),
                          M.gameMgr.playVibrate(!0),
                          M.soundMgr.play(5),
                          M.commonData.GGame.showTipInfo('people +5', 2000));
              }
      }
      calculateOtherAi() {
          let e = this.single.transform.position.clone(), t = M.gameData.playerArr, i = 6 + 0.1 * this.peopleCount;
          i *= 2;
          let s = this.playerFormMgr.cubeCal;
          for (let a = 1; a < t.length; ++a)
              if (t[a].isActive) {
                  let o = t[a].item.transform.position.clone();
                  if (Math.abs(o.x - e.x) < i && Math.abs(o.z - e.z) < i) {
                      let e = t[a].lg.playerFormMgr.cubeCal;
                      (this.calculateBoxByBoxEx(s, e) || this.calculateBoxByBoxEx(e, s)) &&
                          (this.peopleCount > t[a].lg.peopleCount
                              ? t[a].lg.hurtValue(this, 2)
                              : this.peopleCount < t[a].lg.peopleCount && this.hurtValue(t[a].lg, 2));
                  }
              }
      }
      addPeople(e) {
          (this.peopleCount += e), this.setFormLevel();
      }
      explodeHurt() {
          let e = new Date().valueOf();
          if (e - this.lastExplodeTime > 1e3) {
              this.lastExplodeTime = e;
              let t = Math.floor(this.peopleCount / 2);
              t < 5 && (t = 5), this.hurtValue(null, t, !0), M.gameMgr.playVibrate(!1);
          }
      }
      hurtValue(e, t, i = !1) {
          if (!this.bInvincible && this.isMove) {
              if (i)
                  this.peopleCount -= t;
              else {
                  let i = new Date().valueOf();
                  i - this.hurtTime > 100 &&
                      ((this.hurtTime = i),
                          t > this.peopleCount + 1 && (t = this.peopleCount + 1),
                          (this.peopleCount -= t),
                          e && e.isMove && e.addPeople(t));
              }
              this.peopleCount <= 0
                  ? ((this.isMove = !1),
                      (this.single.active = !1),
                      (M.gameData.playerArr[0].isActive = !1),
                      this.revivalCount < 1 && M.commonData.GGame.gameTime < 60
                          ? (this.setRevival(), e && M.commonData.GGame.killTip(e.index, this.index))
                          : ((M.gameData.playerArr[0].deadTime = M.commonData.GGame.gameTime),
                              M.gameMgr.gameEndSet(!1)))
                  : this.setFormLevel();
          }
      }
      setRevival() {
          Laya.Scene.open('views/revivalView.scene', !1, null, new Laya.Handler(this, function (e) {
              this.revivalPage = e;
          }));
      }
      lateRevival(e) {
          M.gameData.isStart &&
              ((this.bInvincible = !0),
                  (this.peopleCount = e ? 2 : 0),
                  (M.gameData.playerArr[0].isActive = !0),
                  this.revivalCount++,
                  (this.isMove = !0),
                  (this.single.active = !0),
                  this.setFormLevel(),
                  (this.revivalPage = null),
                  this.playerFormMgr.setBInvincible(!0),
                  Laya.timer.once(5e3, this, () => {
                      (this.bInvincible = !1), this.playerFormMgr.setBInvincible(!1);
                  }));
      }
      videoSetStop() {
          this.bVideo = !0;
          let e = M.gameData.playerArr;
          for (let t = 0; t < e.length; ++t)
              e[t].lg.isMove ? ((this.stopArr[t] = !0), (e[t].lg.isMove = !1)) : (this.stopArr[t] = !1);
      }
      videoSetStart() {
          this.bVideo = !1;
          let e = M.gameData.playerArr;
          for (let t = 0; t < e.length; ++t)
              this.stopArr[t] && ((e[t].lg.isMove = !0), e[t].lg.setFormLevel());
      }
      onLateUpdate() {
          if (M.commonData.GGame) {
              let e = this.single.transform.position.clone();
              e.y += 2.5;
              let t = new Laya.Vector4(0, 0, 0, 0);
              M.gameMgr.camera.viewport.project(e, M.gameMgr.camera.projectionViewMatrix, t);
              new Laya.Vector2(t.x / Laya.stage.clientScaleX, t.y / Laya.stage.clientScaleY - Laya.stage.height / 2);
          }
      }
      gameVictory() {
          Laya.timer.clearAll(this);
          let e = M.storageMgr.getMaxPeople();
          e < this.peopleCount && M.storageMgr.setMaxPeople(e),
              M.soundMgr.stopBGM(),
              M.soundMgr.play(9),
              (this.isMove = !1),
              (M.gameMgr.isVictory = !0),
              M.gameMgr.playVibrate(!1),
              (M.gameMgr.cameraEff.active = !1),
              (M.gameMgr.cameraEff.active = !0),
              Laya.timer.once(3e3, this, () => {
                  (M.gameMgr.cameraEff.active = !1), M.commonData.GGame.showEndPage();
              });
      }
      gameFail(e = !0) {
          Laya.timer.clearAll(this),
              (this.isMove = !1),
              M.soundMgr.stopBGM(),
              M.soundMgr.play(8),
              M.gameMgr.playVibrate(!1),
              (M.gameMgr.isVictory = !1),
              Laya.timer.once(2e3, this, function () {
                  M.gameMgr.gameOver();
              });
      }
      pointInPolygon(e, t, i) {
          let s = [], a = [], o = 0;
          for (let n = 0; n < i.numChildren; ++n) {
              let r = i.getChildAt(n);
              if ('cubePoint' == r.name) {
                  let i = r.transform.position.clone();
                  Laya.Vector3.subtract(i, e, i),
                      (s[o] = i.clone()),
                      (i = r.transform.position.clone()),
                      Laya.Vector3.subtract(i, t, i),
                      (a[o] = i.clone()),
                      o++;
              }
          }
          let n = s.length, r = 0, l = [], h = [];
          for (let e = 0; e < n; ++e) {
              let t = s[e].clone(), i = s[(e + 1) % n].clone();
              t.x * i.z - t.z * i.x > 0 ? ((r += 1), (l[e] = 1)) : ((r -= 1), (l[e] = -1)),
                  (t = a[e].clone()),
                  (i = a[(e + 1) % n].clone()),
                  t.x * i.z - t.z * i.x > 0 ? (h[e] = 1) : (h[e] = -1);
          }
          if (r == n || r == -n) {
              for (let i = 0; i < n; ++i)
                  if (l[i] * h[i] < 0) {
                      let a = s[i].clone(), o = s[(i + 1) % n].clone(), r = s[i].clone(), l = s[i].clone();
                      if ((Laya.Vector3.add(a, e, a),
                          Laya.Vector3.add(o, e, o),
                          Math.max(a.x, o.x) < Math.min(t.x, e.x) ||
                              Math.min(a.x, o.x) > Math.max(t.x, e.x) ||
                              Math.max(a.z, o.z) < Math.min(t.z, e.z) ||
                              Math.min(a.z, o.z) > Math.max(t.z, e.z)))
                          continue;
                      Laya.Vector3.subtract(e, t, r),
                          Laya.Vector3.subtract(o, a, l),
                          Laya.Vector3.normalize(l, l);
                      let h = Laya.Vector3.dot(l, r);
                      return (Laya.Vector3.scale(l, h, l),
                          Laya.Vector3.add(t, l, t),
                          (t.y = e.y),
                          (this.single.transform.position = t.clone()),
                          !0);
                  }
              this.single.transform.position = t.clone();
          }
          return !1;
      }
      calculateBoxByBoxEx(e, t) {
          let i = e.transform.position.clone(), s = new Laya.Vector3(), a = new Laya.Vector3();
          e.transform.getForward(s),
              e.transform.getRight(a),
              Laya.Vector3.normalize(s, s),
              Laya.Vector3.normalize(a, a);
          let o = e.transform.localScale.clone(), n = new Laya.Vector3();
          Laya.Vector3.scale(o, 0.5, n);
          let r = new Laya.Vector3(), l = new Laya.Vector3();
          Laya.Vector3.scale(s, n.z, r), Laya.Vector3.scale(a, n.x, l);
          let h = [];
          for (let e = 0; e < 4; ++e)
              if (((h[e] = new Laya.Vector3(i.x, i.y, i.z)),
                  e > 1
                      ? ((h[e].x += r.x), (h[e].y += r.y), (h[e].z += r.z))
                      : ((h[e].x -= r.x), (h[e].y -= r.y), (h[e].z -= r.z)),
                  e % 2 == 1
                      ? ((h[e].x += l.x), (h[e].y += l.y), (h[e].z += l.z))
                      : ((h[e].x -= l.x), (h[e].y -= l.y), (h[e].z -= l.z)),
                  this.pointInBoxCube(h[e].clone(), t)))
                  return !0;
          return !1;
      }
      pointInBoxCube(e, t) {
          let i = t.transform.position.clone(), s = new Laya.Vector3(0, 0, 0);
          Laya.Vector3.subtract(e, i, s);
          let a = new Laya.Vector3(0, 0, 0);
          t.transform.getForward(a), Laya.Vector3.normalize(a.clone(), a);
          let o = Laya.Vector3.dot(a, s), n = new Laya.Vector3(0, 0, 0);
          t.transform.getRight(n), Laya.Vector3.normalize(n.clone(), n);
          let r = Laya.Vector3.dot(n, s), l = t.transform.localScale.clone();
          return Math.abs(r) < l.x / 2 && Math.abs(o) < l.z / 2;
      }
  }

  class playerLg extends Laya.Script {
      init(e) {
          this.single = e;
          let t = this.single.getChildAt(0);
          (t.transform.position = new Laya.Vector3(0, 0.3, 0)),
              (this.showPlayer = t),
              (this.showPlayerLg = t.addComponent(showPlayerLg)),
              this.showPlayerLg.init(t, !1);
          let i = {
              item: this.showPlayer,
              isActive: !0,
              lg: this.showPlayerLg,
              index: 0,
              deadTime: 0
          };
          (M.gameData.playerArr[0] = i), this.changeSkin();
      }
      changeSkin(e = -1) {
          -1 == e && (e = M.commonData.skinId), this.showPlayerLg.setSkin(e);
      }
      setPlayerMove(e, t) {
          this.showPlayerLg.setPlayerMove(e, t);
      }
      setMove(e) {
          this.showPlayerLg.setMove(e);
      }
      reSetPlayer() {
          this.showPlayerLg.reset();
      }
      onUpdate() { }
  }

  class speedRoot extends Laya.Script {
      constructor() {
          super(), (this.data = null), (this.indexArr = []), (this.dataArr = []), (this.speedArr = []);
      }
      init(e) {
          (this.speedRoot = e),
              (this.single = e.getChildAt(0)),
              this.single.addComponent(single),
              (this.single.active = !1),
              this.setPointData(),
              this.setStartData();
      }
      setPointData() {
          let e = M.configMgr.getLevelData()[M.gameMgr.randLevel].models, t = [];
          for (let i = 0; i < e.length; ++i)
              'daoju1_point' == e[i].name && t.push(new Laya.Vector3(e[i].pos.x, e[i].pos.y, e[i].pos.z));
          this.data = t;
      }
      setRandom() {
          for (let e = 0; e < this.data.length; ++e)
              (this.dataArr[e] = !1), (this.indexArr[e] = e);
          for (let e = 0; e < this.indexArr.length; ++e) {
              let t = Math.floor(Math.random() * (this.indexArr.length - e) + e), i = this.indexArr[t];
              (this.indexArr[t] = this.indexArr[e]), (this.indexArr[e] = i);
          }
      }
      setStartData() {
          this.setRandom();
          for (let e = 0; e < 5; ++e)
              (this.dataArr[this.indexArr[e]] = !0),
                  this.setAddSpeed(this.data[this.indexArr[e]].clone(), this.indexArr[e]);
      }
      getRevivalPos(e) {
          let t = [];
          for (let e = 0; e < this.dataArr.length; ++e)
              this.dataArr[e] || t.push(e);
          if (((this.dataArr[e] = !1), t.length > 0)) {
              let e = Math.floor(Math.random() * t.length);
              return (this.dataArr[t[e]] = !0), t[e];
          }
          return -1;
      }
      reset() {
          for (let e = 0; e < this.speedArr.length; ++e)
              (this.speedArr[e].item.active = !1),
                  this.speedArr[e].lg.clear(),
                  Laya.Pool.recover('staticSpeed', this.speedArr[e].item);
          (this.speedArr = []), this.setStartData();
      }
      addSpeed() {
          let e = Laya.Sprite3D.instantiate(this.single, this.speedRoot);
          return (e.name = 'staticSpeed'), e;
      }
      setAddSpeed(e, t) {
          let i = Laya.Pool.getItem('staticSpeed');
          i || (i = this.addSpeed()),
              (i.active = !0),
              (i.transform.position = e.clone()),
              i.getComponent(single).init(i);
          let s = {
              item: i,
              isActive: !0,
              lg: i.getComponent(single),
              posi: t
          };
          this.speedArr.push(s);
      }
  }

  class treePointRoot extends Laya.Script {
      constructor() {
          super(), (this.data = null), (this.treeArr = []);
      }
      init(e) {
          (this.treeRoot = e),
              (this.single = e.getChildAt(0)),
              this.single.addComponent(single),
              (this.single.active = !1),
              this.setPointData(),
              this.setStartData();
      }
      setPointData() {
          let e = M.configMgr.getLevelData()[M.gameMgr.randLevel].models, t = [];
          for (let i = 0; i < e.length; ++i)
              'tree_point' == e[i].name && t.push(new Laya.Vector3(e[i].pos.x, e[i].pos.y, e[i].pos.z));
          this.data = t;
      }
      setStartData() {
          for (let e = 0; e < this.data.length; ++e)
              this.setAddTree(this.data[e].clone());
      }
      reset() {
          for (let e = 0; e < this.treeArr.length; ++e)
              (this.treeArr[e].item.active = !1),
                  this.treeArr[e].lg.clear(),
                  Laya.Pool.recover('staticTree', this.treeArr[e].item);
          (this.treeArr = []), this.setStartData();
      }
      addTree() {
          let e = Laya.Sprite3D.instantiate(this.single, this.treeRoot);
          return (e.name = 'staticTree'), e;
      }
      setAddTree(e) {
          let t = Laya.Pool.getItem('staticTree');
          t || (t = this.addTree()),
              (t.active = !0),
              (t.transform.position = e.clone()),
              t.getComponent(single).init(t);
          let i = {
              item: t,
              isActive: !0,
              lg: t.getComponent(single)
          };
          this.treeArr.push(i);
      }
  }

  class wallPointRoot extends Laya.Script {
      constructor() {
          super(), (this.wallArr = []);
      }
      init(e) {
          (this.wallRoot = e),
              (this.single = e.getChildAt(0)),
              this.single.addComponent(single),
              (this.single.active = !1),
              this.setPointData();
      }
      setPointData() {
          let e = M.configMgr.getLevelData()[M.gameMgr.randLevel].models;
          for (let t = 0; t < e.length; ++t)
              if ('wall_point' == e[t].name) {
                  let i = new Laya.Vector3(e[t].pos.x, e[t].pos.y, e[t].pos.z);
                  this.setAddWall(i.clone(), e[t].r);
              }
      }
      reset() {
          for (let e = 0; e < this.wallArr.length; ++e)
              (this.wallArr[e].item.active = !1),
                  this.wallArr[e].lg.clear(),
                  Laya.Pool.recover('staticWall', this.wallArr[e].item);
          (this.wallArr = []), this.setPointData();
      }
      addWall() {
          let e = Laya.Sprite3D.instantiate(this.single, this.wallRoot);
          return (e.name = 'staticWall'), e;
      }
      setAddWall(e, t) {
          let i = Laya.Pool.getItem('staticWall');
          i || (i = this.addWall()),
              (i.active = !0),
              (i.transform.position = e.clone()),
              i.getComponent(single).init(i);
          let s = {
              item: i,
              isActive: !0,
              lg: i.getComponent(single)
          };
          (i.transform.localRotationEulerY = t), this.wallArr.push(s);
      }
  }

  class gameMgr {
      constructor() {
          (this.touchMove = new Laya.Vector2(0, 0)),
              (this.roleMatArr = []),
              (this.isOver = !0),
              (this.isPlay = !0),
              (this.isTouchDown = !1),
              (this.oripos = new Laya.Vector2(0, 0)),
              (this.count = 0),
              (this._fieldOfView = null),
              (this._viewportRatio = null),
              (this.initCamera = !1),
              (this.randLevel = 0),
              (this.currentColor = 0),
              (this.first = !0),
              (this.onWDown = !1),
              (this.onADown = !1),
              (this.onSDown = !1),
              (this.onDDown = !1),
              (this.bSetSpeed = !0),
              (this.bSetCamera = !0),
              (this.ballonShowCount = 0),
              (this.touchPos = new Laya.Vector2(0, 0)),
              (this.lastTime = 0),
              (this.movex = 0),
              (this.movey = 0);
      }
      init() {
          (M.gameData.gameMgr = this),
              this.addEvent(),
              this.initScene(),
              (this.ballonShowCount = 0),
              Laya.stage.on('DEVICE_ON_HIDE', this, this.onHide),
              Laya.stage.on('DEVICE_ON_SHOW', this, this.onShow);
      }
      initScene() {
          if (((this.randLevel = Math.floor(5 * Math.random())),
              (this.scene = M.resourceMgr.mainScene),
              (this.camera = this.scene.getChildByName('Main Camera')),
              Laya.Browser.onIOS && !this.initCamera)) {
              this.initCamera = !0;
              let e = this.camera;
              (this._fieldOfView && this._viewportRatio) ||
                  ((this._fieldOfView = e.fieldOfView),
                      (this._viewportRatio = e.viewport.height / ((1334 * Laya.RenderState2D.width) / 750)),
                      (e.fieldOfView = this._fieldOfView * this._viewportRatio));
          }
          let e = this.scene.getChildByName('Directional Light');
          (this.light = e),
              (this.roleMat = this.scene.getChildByName('roleMat')),
              (this.roleMatArr = this.roleMat._render.materials),
              (this.roleMat.active = !1),
              (this.showModel = this.scene.getChildByName('showModel')),
              (this.showModel.active = !1),
              (this.cameraEff = this.camera.getChildByName('htdj10')),
              (this.cameraEff.active = !1);
          let t = this.cameraEff.transform.localPosition.clone();
          Laya.Vector3.scale(t, -1 / 8, t),
              (this.cameraEff.transform.localPosition = t.clone()),
              D.initShader(),
              (this.calculateP = this.scene.getChildByName('calculateP')),
              (this.groundScene = this.scene.getChildByName('scene')),
              (this.groundMgr = this.groundScene.addComponent(groundScene)),
              this.groundMgr.init(this.groundScene),
              (this.explode = this.scene.getChildByName('explode')),
              (this.explodeMgr = this.explode.addComponent(explode)),
              this.explodeMgr.init(this.explode),
              (this.player = this.scene.getChildByName('player'));
          let i = Laya.Sprite3D.instantiate(this.player.getChildAt(0).getChildAt(0));
          (this.aiPointRoot = this.scene.getChildByName('Ai_point')),
              (this.aiPointLg = this.aiPointRoot.addComponent(aiPointRoot)),
              this.aiPointLg.init(this.aiPointRoot),
              (this.treePointRoot = this.scene.getChildByName('tree_point')),
              (this.treePointLg = this.treePointRoot.addComponent(treePointRoot)),
              this.treePointLg.init(this.treePointRoot),
              (this.wallPointRoot = this.scene.getChildByName('wall_point')),
              (this.wallPointLg = this.wallPointRoot.addComponent(wallPointRoot)),
              this.wallPointLg.init(this.wallPointRoot),
              (this.coinPointRoot = this.scene.getChildByName('coin_point')),
              (this.coinPointLg = this.coinPointRoot.addComponent(coinPointRoot)),
              this.coinPointLg.init(this.coinPointRoot),
              (this.mudRoot = this.scene.getChildByName('mud_point')),
              (this.mudLg = this.mudRoot.addComponent(mudRoot)),
              this.mudLg.init(this.mudRoot),
              (this.nailRoot = this.scene.getChildByName('nail_point')),
              (this.nailLg = this.nailRoot.addComponent(nailRoots)),
              this.nailLg.init(this.nailRoot),
              (this.speedRoot = this.scene.getChildByName('daoju1_point')),
              (this.speedLg = this.speedRoot.addComponent(speedRoot)),
              this.speedLg.init(this.speedRoot),
              (this.addRoot = this.scene.getChildByName('daoju2_point')),
              (this.addLg = this.addRoot.addComponent(addRoot)),
              this.addLg.init(this.addRoot),
              (this.aiRoot = this.scene.getChildByName('ai')),
              this.aiRoot.addChild(i),
              (this.aiMgr = this.aiRoot.addComponent(aiRoot)),
              this.aiMgr.init(this.aiRoot),
              (this.effectRoot = this.scene.getChildByName('effect')),
              (this.effectMgr = this.effectRoot.addComponent(effectMgr)),
              this.effectMgr.init(this.effectRoot),
              (this.playerLg = this.player.addComponent(playerLg)),
              this.playerLg.init(this.player.getChildAt(0)),
              (this.obstacle = this.scene.getChildByName('obstacle')),
              (this.obstacleLg = this.obstacle.addComponent(obstacle)),
              this.obstacleLg.init(this.obstacle),
              (this.cameraLg = this.camera.addComponent(cameraLg)),
              this.cameraLg.init(this.camera);
      }
      gameEndSet(e) {
          console.error('游戏结束'),
              e ? this.playerLg.showPlayerLg.gameVictory() : this.playerLg.showPlayerLg.gameFail(),
              this.aiMgr.gameOverSet();
      }
      gameReset() {
          (this.randLevel = Math.floor(5 * Math.random())),
              (this.isVictory = !1),
              (M.commonData.freeSkinId = -1),
              this.treePointLg.reset(),
              this.wallPointLg.reset(),
              this.nailLg.reset(),
              this.mudLg.reset(),
              this.speedLg.reset(),
              this.addLg.reset(),
              this.aiMgr.reset(),
              this.obstacleLg.obstacleReset(),
              this.playerLg.reSetPlayer(),
              this.playerLg.changeSkin(),
              this.cameraLg.reSet(),
              this.groundMgr.reset(),
              (this.isOver = !0),
              (M.gameData.isStart = !1);
      }
      setSky() { }
      onHide() {
          Laya.timer.scale = 0;
      }
      onShow() {
          Laya.timer.scale = 1;
      }
      setGameOver() {
          (M.gameData.isStart = !1), (this.cameraLg.isMove = !1);
      }
      gameReviel() {
          M.gameData.isStart = !0;
      }
      gameStart() {
          (this.isOver = !1), this.gameStart2();
      }
      gameStart2() {
          (M.gameData.isStart = !0),
              this.cameraLg.setCameraData(!0),
              this.playerLg.setMove(!0),
              this.aiMgr.startMove();
      }
      setFog(e) { }
      addEvent() {
          Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown),
              Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp),
              Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove),
              Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown),
              Laya.stage.on(Laya.Event.KEY_UP, this, this.onKeyUp),
              Laya.stage.on(Laya.Event.BLUR, this, this.onBlur),
              Laya.timer.frameLoop(1, this, this.onUpdate);
      }
      onContinueGame() {
          Laya.Scene.open('views/home.scene', !1, Laya.Handler.create(this, e => { }));
      }
      onBlur() {
          (this.onWDown = !1), (this.onADown = !1), (this.onSDown = !1), (this.onDDown = !1);
      }
      onUpdate() {
          if (!(Laya.timer.delta > 500 || this.isTouchDown) && this.playerLg && M.commonData.GGame) {
              var e = new Laya.Vector2(0, 0);
              this.onWDown && (e.y = -1),
                  this.onADown && (e.x = -1),
                  this.onSDown && (e.y = 1),
                  this.onDDown && (e.x = 1),
                  M.commonData.GGame.setCircleBox(new Laya.Vector2(0, 0), e);
          }
      }
      onKeyDown(e) {
          switch (e.keyCode) {
              case Laya.Keyboard.W:
              case Laya.Keyboard.UP:
                  this.onWDown = !0;
                  break;
              case Laya.Keyboard.A:
              case Laya.Keyboard.LEFT:
                  this.onADown = !0;
                  break;
              case Laya.Keyboard.S:
              case Laya.Keyboard.DOWN:
                  this.onSDown = !0;
                  break;
              case Laya.Keyboard.D:
              case Laya.Keyboard.RIGHT:
                  this.onDDown = !0;
          }
      }
      onKeyUp(e) {
          switch (e.keyCode) {
              case Laya.Keyboard.W:
              case Laya.Keyboard.UP:
                  this.onWDown = !1;
                  break;
              case Laya.Keyboard.A:
              case Laya.Keyboard.LEFT:
                  this.onADown = !1;
                  break;
              case Laya.Keyboard.S:
              case Laya.Keyboard.DOWN:
                  this.onSDown = !1;
                  break;
              case Laya.Keyboard.D:
              case Laya.Keyboard.RIGHT:
                  this.onDDown = !1;
          }
      }
      onMouseDown(e) {
          (this.isTouchDown = !0),
              (this.oripos = new Laya.Vector2(e.stageX, e.stageY)),
              (this.touchPos = this.oripos.clone()),
              this.playerLg &&
                  M.gameData.isStart &&
                  M.commonData.GGame &&
                  ((M.commonData.GGame.circleBox.visible = !0),
                      M.commonData.GGame.setCircleBox(this.touchPos, this.touchPos));
      }
      onMouseUp() {
          (this.count = 0),
              (this.isTouchDown = !1),
              this.playerLg &&
                  M.gameData.isStart &&
                  M.commonData.GGame &&
                  (M.commonData.GGame.circleBox.visible = !1);
      }
      onMouseMove(e) {
          this.playerLg &&
              this.count > 0 &&
              (e.stageX,
                  this.oripos.x,
                  e.stageY,
                  this.oripos.y,
                  (this.isTouchDown = !0),
                  (this.oripos.x = e.stageX),
                  (this.oripos.y = e.stageY),
                  M.commonData.GGame && M.commonData.GGame.setCircleBox(this.touchPos, this.oripos)),
              this.count++;
      }
      setDirection() { }
      playVibrate(e) {
      }
      destoryAll() { }
      gameOver() {
          if (this.isOver)
              return void console.log('is game over.');
          M.gameData.gameCount++, (this.isOver = !0);
          let e = 'views/fail.scene';
          this.isVictory ? ((e = 'views/success.scene'), this.showResult(e)) : this.showResult(e);
      }
      showResult(e) {
          M.glEvent.event('over_game_event', {
              isVictory: this.isVictory
          });
      }
      addBoxRigibody(e, t, i = null) {
          let s = e.addComponent(Laya.CannonRigidbody3D), a = new Laya.CannonBoxColliderShape(t.x, t.y, t.z);
          return i && (a.localOffset = i), a.updateLocalTransformations(), (s.colliderShape = a), s;
      }
      addSphereRigibody(e, t, i) {
          let s = e.addComponent(Laya.CannonRigidbody3D), a = new Laya.CannonSphereColliderShape(t);
          return ((a.localOffset = i || new Laya.Vector3()),
              a.updateLocalTransformations(),
              (s.colliderShape = a),
              s);
      }
  }

  class rankMgr {
      init() {
      }
      resetSize(e, t) {
      }
      postMessage(e) {
          null != e && null != this.openDataContext && this.openDataContext.postMessage(e);
      }
      uploadScroe(e) {
          this.postMessage({
              cmd: 'submit_scroe',
              score: e
          });
      }
      showFriendRank(e) {
          this.postMessage({
              cmd: e ? 'open_friend_rank' : 'close_friend_rank'
          });
      }
      destroyFriendRank() {
          this.postMessage({
              cmd: 'destroy_friend_rank'
          });
      }
      showLiteRank(e) {
          this.postMessage({
              cmd: e ? 'open_lite_rank' : 'close_lite_rank'
          });
      }
      showOverFriendTips(e, t) {
          this.postMessage({
              cmd: e ? 'open_over_friend' : 'close_over_friend',
              score: t
          });
      }
      showLoopFriendTips(e, t) {
          this.postMessage({
              cmd: e ? 'open_loop_friend' : 'close_loop_friend',
              score: t
          });
      }
      restartGame() {
          this.postMessage({
              cmd: 'restart_game'
          });
      }
      showFirstFriendTips(e) {
          this.postMessage({
              cmd: e ? 'open_first_friend' : 'close_first_friend',
              score: 0
          });
      }
      onFrientMouseEvent(e) {
          this.postMessage(e);
      }
  }

  class resourceMgr {
      constructor() {
          (this.modelPrefabs = {}),
              (this.loadFinishCb = null),
              (this.resource = [
                  {
                      url: 'res/scene/LayaScene_Scene/Conventional/Scene.ls',
                      clas: Laya.Scene,
                      priority: 1
                  }
              ]),
              (this.sceneID = 0),
              (this.isLoad = !1),
              (this.loadingScene = !1);
      }
      init(e, t) {
          (this.loadFinishCb = t), (this.glEvent = e), this.loadRes();
      }
      loadRes() {
          Laya.loader.create('res/scene/LayaScene_Scene/Conventional/Scene.ls', Laya.Handler.create(this, this.onLoadFinish, null, !1), Laya.Handler.create(this, this.onLoading, null, !1), Laya.Loader.HIERARCHY),
              Laya.loader.on(Laya.Event.ERROR, this, e => {
                  console.error('load 3dres error:', e);
              });
      }
      onLoadFinish(e) {
          if ((e || (e = !0), e)) {
              if (this.isLoad)
                  return;
              (this.isLoad = !0),
                  M.glEvent.event('load_finish_event', {
                      target: '3dres'
                  }),
                  this.loadFinishCb(),
                  this.onSceneEvent(e);
          }
      }
      onLoading(e) {
          M.glEvent.event('load_pass_event', e);
      }
      isLoadingScene() {
          return this.loadingScene;
      }
      onSceneEvent(e) {
          (this.loadingScene = !1), e && this.onScenes();
      }
      onScenes() {
          if (this.resource) {
              let e = Laya.loader.getRes(this.resource[0].url);
              Laya.stage.addChild(e),
                  Laya.stage.setChildIndex(e, 0),
                  (this.mainScene = e),
                  (this.mainCamera = e.getChildByName('Main Camera')),
                  M.gameMgr.init();
          }
          else
              console.error('res cfg is null.');
      }
  }

  class soundMgr {
      constructor() {
          this._bgmCtx = null;
          this.isFire = !1;
          this._pathRoot = 'res/music/';
          this._soundCtx = {};
          this._soundFile = [];
      }
      init() {
          let e = this._pathRoot, t = '';
          this._soundFile;
          for (let i = 0; i < 12; ++i) {
              t = 'music' + (i + 1);
              let s = new Laya.SoundChannel();
              (s.url = e + t + '.wav'), Laya.SoundManager.addChannel(s), (this._soundCtx[t] = !0);
          }
      }
      onAppHide() {
          this.stopBGM();
      }
      onAppShow() {
          M.gameData.isStart ? this.playBGM('music2') : this.playBGM('music1');
      }
      play(e) {
          this._soundCtx['music' + e] &&
              M.storageMgr.isPlaySound() &&
              Laya.SoundManager.playSound(this._pathRoot + 'music' + e + '.wav');
      }
      stop(e) {
          this._soundCtx['music' + e] &&
              Laya.SoundManager.stopSound(this._pathRoot + 'music' + e + '.wav');
      }
      stopAll() {
          Laya.SoundManager.stopAll();
      }
      playBGM(e) {
          if (!M.storageMgr.isPlaySound())
              return;
          let t = this._pathRoot + e + '.wav';
          Laya.Browser.onWeiXin
              ? (null != this._bgmCtx &&
                  (this._bgmCtx.stop(), this._bgmCtx.destroy(), (this._bgmCtx = null)),
                  (this._bgmCtx = wx.createInnerAudioContext()),
                  (this._bgmCtx.src = t),
                  (this._bgmCtx.loop = !0),
                  M.storageMgr.isPlaySound() && this._bgmCtx.play())
              : (Laya.SoundManager.stopMusic(), Laya.SoundManager.playMusic(t, 0));
      }
      stopBGM() {
          Laya.Browser.onWeiXin
              ? null != this._bgmCtx && this._bgmCtx.stop()
              : Laya.SoundManager.stopMusic();
      }
  }

  class commonData {
      constructor() {
          (this.useTime = 1e3),
              (this.levelIndex = 0),
              (this.newLevel = 1),
              (this.maxScore = 0),
              (this.userCoin = 0),
              (this.skinValueArr = [500, 500, 500, 500, 500, 500]),
              (this.unlockCount = 0),
              (this.skinId = 0),
              (this.freeSkinId = -1),
              (this.isFreeId = !1),
              (this.selectSkin = 1),
              (this.getCoinCount = 0),
              (this.bHomeBgm = !1),
              (this.firstMusic = !1),
              (this.userInfo = {}),
              (this.showScene = null),
              (this.showScene2 = null),
              (this.lastScene = null),
              (this.freeSkinCount = 0),
              (this.coinFlyView = null),
              (this.userId = ''),
              (this.coinTip = null),
              (this.coinTipBox = null),
              (this.curScene = null),
              (this.nameArr = []),
              (this.nameStr =
                  'computer1,computer2,computer3,computer4,computer5,computer6,computer7,computer8,computer9,computer10,computer11,computer12,computer13,computer14,computer15,computer16,computer17,computer18,computer19,computer20,computer21,computer22,computer23,computer24,computer25,computer26,computer27,computer28,computer29,computer30,computer31,computer32,computer33,computer34,computer35,computer36,computer37,computer38,computer39,computer40,computer41,computer42,computer43,computer44,computer45,computer46,computer47,computer48,computer49,computer50,computer51,computer52,computer53,computer54,computer55,computer56,computer57,computer58,computer59,computer60,computer61,computer62,computer63,computer64,computer65,computer66,computer67,computer68,computer69,computer70,computer71,computer72,computer73,computer74,computer75,computer76,computer77,computer78,computer79,computer80,computer81,computer82,computer83,computer84,computer85,computer86,computer87,computer88,computer89,computer90,computer91,computer92,computer93,computer94,computer95,computer96,computer97,computer98,computer99');
      }
  }

  class storageMgr {
      constructor() {
          this._userData = null;
          this._userDataKey = 'MessFit_api_secret';
          this.init();
      }
      init() {
          if (((this._userData = {
              isPlaySound: !0,
              isPlayVibrate: !0,
              levelID: 0,
              signinTime: 0,
              skinTipsTime: 0
          }),
              this.readStorage(),
              this._userData.gameStatus || (this._userData.gameStatus = {}),
              this._userData.gameStatus.awardGold || (this._userData.gameStatus.awardGold = 0),
              this._userData.gameStatus.unlockCount || (this._userData.gameStatus.unlockCount = 0),
              this._userData.gameStatus.lastRegisterTime ||
                  (this._userData.gameStatus.lastRegisterTime = 0),
              this._userData.gameStatus.lastLuckyDay || (this._userData.gameStatus.lastLuckyDay = 0),
              this._userData.gameStatus.luckyCount || (this._userData.gameStatus.luckyCount = 0),
              this._userData.gameStatus.skinCount || (this._userData.gameStatus.skinCount = 0),
              this._userData.gameStatus.maxPeople || (this._userData.gameStatus.maxPeople = 0),
              this._userData.gameStatus.lastRankTime || (this._userData.gameStatus.lastRankTime = 1),
              !this._userData.gameStatus.homeHitLevel)) {
              this._userData.gameStatus.homeHitLevel = [];
              for (let e = 0; e < 3; ++e)
                  this._userData.gameStatus.homeHitLevel[e] = 1;
          }
          if (!this._userData.gameStatus.skinArr) {
              (this._userData.gameStatus.skinArr = []), (this._userData.gameStatus.skinArr.length = 12);
              for (let e = 0; e < 12; ++e)
                  this._userData.gameStatus.skinArr[e] = 0 == e;
          }
          if (!this._userData.gameStatus.registerArr) {
              (this._userData.gameStatus.registerArr = []),
                  (this._userData.gameStatus.registerArr.length = 7);
              for (let e = 0; e < 7; ++e)
                  this._userData.gameStatus.registerArr[e] = !1;
          }
          this._userData.gameStatus.skinId || (this._userData.gameStatus.skinId = 0),
              this._userData.gameStatus.skinIdDemons || (this._userData.gameStatus.skinIdDemons = 3),
              this._userData.userInfo || (this._userData.userInfo = {}),
              this._userData.userInfo.gold || (this._userData.userInfo.gold = 0),
              this._userData.gameStatus.level || (this._userData.gameStatus.level = 1),
              this._userData.gameStatus.curLevel || (this._userData.gameStatus.curLevel = 0),
              this.writeStorage(),
              this.setRegisterTime(),
              this.setLuckyDay();
      }
      readStorage() {
          let e = Laya.LocalStorage.getItem(this._userDataKey);
          e && (this._userData = JSON.parse(e));
      }
      writeStorage() {
          this._userData && Laya.LocalStorage.setItem(this._userDataKey, JSON.stringify(this._userData));
      }
      clearStorage() {
          Laya.LocalStorage.removeItem(this._userDataKey);
      }
      isPlaySound() {
          return this._userData.isPlaySound;
      }
      setPlaySound(e) {
          (this._userData.isPlaySound = e), this.writeStorage();
      }
      isPlayVibrate() {
          return this._userData.isPlayVibrate;
      }
      setPlayVibrate(e) {
          (this._userData.isPlayVibrate = e), this.writeStorage();
      }
      setSkinTips(e) {
          (this._userData.skinTipsTime = e ? 0 : Math.floor(Date.parse(new Date().toString()) / 1e3)),
              this.writeStorage();
      }
      isSkinTips(e) {
          return Math.floor(this._userData.projectData.lastTime / 864e5) != Math.floor(e / 864e5);
      }
      get userInfo() {
          return this._userData.userInfo;
      }
      get unlockSkinData() {
          return this._userData.userInfo.skin;
      }
      unlockSkin(e) {
          this._userData.gameStatus.skinArr[e] ||
              ((this._userData.gameStatus.skinArr[e] = !0),
                  this._userData.gameStatus.unlockCount++,
                  this.writeStorage());
      }
      getUnlockCount() {
          return this._userData.gameStatus.unlockCount;
      }
      setSkinId(e) {
          (this._userData.gameStatus.skinId = e), this.writeStorage();
      }
      getSkinId() {
          return this._userData.gameStatus.skinId;
      }
      setSkinIdDemons(e) {
          (this._userData.gameStatus.skinIdDemons = e), this.writeStorage();
      }
      getSkinIdDemons() {
          return this._userData.gameStatus.skinIdDemons;
      }
      getSkinArr() {
          return this._userData.gameStatus.skinArr;
      }
      isUnlockSkin(e, t) {
          return -1 != e.indexOf(t);
      }
      get gameStatus() {
          return this._userData.gameStatus;
      }
      get projectData() {
          return this._userData.projectData;
      }
      setGameStausLevel(e) {
          (this._userData.gameStatus.level = e), this.writeStorage();
      }
      setGameStausCurLevel(e) {
          (this._userData.gameStatus.curLevel = e), this.writeStorage();
      }
      getCurLevel() {
          return this._userData.gameStatus.curLevel;
      }
      setAwardGold(e) {
          (this._userData.gameStatus.awardGold = e), this.writeStorage();
      }
      get awardGold() {
          return this._userData.gameStatus.awardGold;
      }
      setRegisterTime() {
          let e = new Date().valueOf() / 1e3, t = this.getLastRegisterTime();
          Math.floor(e / 86400) > Math.floor(t / 86400) && this.setRegisterSingle(!1);
      }
      setRegisterSingle(e) {
          (this._userData.gameStatus.isRegister = e), this.writeStorage();
      }
      getRegisterSingle() {
          return this._userData.gameStatus.isRegister;
      }
      getRegisterArr() {
          return this._userData.gameStatus.registerArr;
      }
      setRegisterArr(e, t) {
          (this._userData.gameStatus.registerArr[e] = t), this.writeStorage();
      }
      getLastRegisterTime() {
          return this._userData.gameStatus.lastRegisterTime;
      }
      setLastRegisterTime(e) {
          (this._userData.gameStatus.lastRegisterTime = e), this.writeStorage();
      }
      getNeedUpdateRank() {
          let e = Math.floor(new Date().valueOf() / 1e3 / 86400);
          return (e > this._userData.gameStatus.lastRankTime &&
              ((this._userData.gameStatus.lastRankTime = e), this.writeStorage(), !0));
      }
      setRankData(e) {
          (this._userData.gameStatus.rankData = e), this.writeStorage();
      }
      getRankData() {
          return this._userData.gameStatus.rankData;
      }
      setLuckyDay() {
          let e = Math.floor(new Date().valueOf() / 1e3 / 86400);
          e > this._userData.gameStatus.lastLuckyDay &&
              ((this._userData.gameStatus.lastLuckyDay = e),
                  (this._userData.gameStatus.luckyCount = 0),
                  this.writeStorage());
      }
      setLuckyCount(e) {
          (this._userData.gameStatus.luckyCount = e), this.writeStorage();
      }
      getLuckyCount() {
          return this._userData.gameStatus.luckyCount;
      }
      setSkinCount(e) {
          (this._userData.gameStatus.skinCount = e), this.writeStorage();
      }
      getSkinCount() {
          return this._userData.gameStatus.skinCount;
      }
      setHomeHitLevel(e, t) {
          (this._userData.gameStatus.homeHitLevel[e] = t), this.writeStorage();
      }
      getHomeHitLevel() {
          return this._userData.gameStatus.homeHitLevel;
      }
      setMaxPeople(e) {
          (this._userData.gameStatus.maxPeople = e), this.writeStorage();
      }
      getMaxPeople() {
          return this._userData.gameStatus.maxPeople;
      }
  }

  class BubbleText extends Laya.Script {
      constructor() {
          super();
      }
      onAwake() {
          let e = this.owner.getChildByName('middleUI');
          (this.toast = e.getChildByName('toast')),
              (this.lblToast = this.toast.getChildByName('lblToast'));
          this.toast.removeSelf();
      }
      showText(e, t) {
          Laya.stage.addChild(this.toast);
          this.lblToast.text = e;
          Laya.timer.once(t, this, this.hideText);
      }
      hideText() {
          this.toast.removeSelf();
      }
      onDestroy() { }
  }

  class uiMgr {
      constructor() { }
      showToast(e, t) {
          this.bubbleText
              ? this.bubbleText.showText(e, t)
              : Laya.Scene.open('views/popups/bubbleText.scene', false, null, Laya.Handler.create(this, i => {
                  this.bubbleText = i.getComponent(BubbleText);
                  Laya.Scene.close('views/popups/bubbleText.scene');
                  this.bubbleText.showText(e, t);
              }));
      }
  }

  class utils {
      constructor() {
          this.oriBtn = null;
      }
      addClickEvent(e, t, i) {
          e.offAllCaller(t);
          {
              let s = 60, a = 1, o = (e.anchorX, e.anchorY, e.width, e.height, e.x, e.y, e.scaleX * a), n = e.scaleX * a, r = 0.9 * a, l = function (t) {
                  (M.utils.oriBtn = e),
                      t.stopPropagation(),
                      M.gameMgr.playVibrate(!0),
                      Laya.Tween.to(e, {
                          scaleX: r,
                          scaleY: r
                      }, s),
                      M.soundMgr.play(13);
              };
              e.on(Laya.Event.MOUSE_DOWN, t, l);
              let h = function (a) {
                  a.stopPropagation(),
                      Laya.Tween.to(e, {
                          scaleX: o,
                          scaleY: n
                      }, s),
                      M.utils.oriBtn && M.utils.oriBtn == e && i && (i.call(t, a), (M.utils.oriBtn = null));
              };
              e.on(Laya.Event.MOUSE_UP, t, h);
              let c = function (t) {
                  t.stopPropagation(),
                      Laya.Tween.to(e, {
                          scaleX: o,
                          scaleY: n
                      }, s),
                      (M.utils.oriBtn = null);
              };
              e.on(Laya.Event.MOUSE_OUT, t, c);
          }
      }
      tweenShake(e, t) {
          let i = new Laya.TimeLine(), s = e.pivotX;
          (e.pivotX = e.width / 2),
              i
                  .addLabel('shake1', 0)
                  .to(e, {
                  rotation: e.rotation + 5
              }, 50, null, 0)
                  .addLabel('shake2', 0)
                  .to(e, {
                  rotation: e.rotation - 6
              }, 50, null, 0)
                  .addLabel('shake3', 0)
                  .to(e, {
                  rotation: e.rotation - 13
              }, 50, null, 0)
                  .addLabel('shake4', 0)
                  .to(e, {
                  rotation: e.rotation + 3
              }, 50, null, 0)
                  .addLabel('shake5', 0)
                  .to(e, {
                  rotation: e.rotation - 5
              }, 50, null, 0)
                  .addLabel('shake6', 0)
                  .to(e, {
                  rotation: e.rotation + 2
              }, 50, null, 0)
                  .addLabel('shake7', 0)
                  .to(e, {
                  rotation: e.rotation - 8
              }, 50, null, 0)
                  .addLabel('shake8', 0)
                  .to(e, {
                  rotation: e.rotation + 3
              }, 50, null, 0)
                  .addLabel('shake9', 0)
                  .to(e, {
                  rotation: 0
              }, 50, null, 0),
              t
                  ? Laya.timer.once(500, this, function () {
                      i.destroy(), (e.rotation = 0), (e.pivotX = s);
                  })
                  : i.on(Laya.Event.COMPLETE, this, function () {
                      i.destroy(), (e.rotation = 0), (e.pivotX = s);
                  }),
              i.play(0, !0);
      }
      PointToSegDist(e, t, i, s, a, o) {
          let n = (a - i) * (e - i) + (o - s) * (t - s), r = 0;
          if (n < 0)
              return (r = Math.sqrt((e - i) * (e - i) + (t - s) * (t - s)));
          let l = (a - i) * (a - i) + (o - s) * (o - s);
          if (n > l)
              return (r = Math.sqrt((e - a) * (e - a) + (t - o) * (t - o)));
          let h = n / l, c = i + (a - i) * h, d = s + (o - s) * h;
          return (r = Math.sqrt((e - c) * (e - c) + (d - t) * (d - t)));
      }
      showCoinFly(e, t, i) {
          M.commonData.coinFlyView
              ? (Laya.stage.addChild(M.commonData.coinFlyView.owner),
                  M.commonData.coinFlyView.setCoinMove(e, t, i))
              : Laya.Scene.open('views/coinFly.scene', !1, null, new Laya.Handler(this, function () {
                  M.commonData.coinFlyView.setCoinMove(e, t, i);
              }));
      }
      showCoinFly2(e, t, i) {
          M.commonData.coinFlyView
              ? (Laya.stage.addChild(M.commonData.coinFlyView.owner),
                  M.commonData.coinFlyView.setCoinMove2(e, t, i))
              : Laya.Scene.open('views/coinFly.scene', !1, null, new Laya.Handler(this, function () {
                  M.commonData.coinFlyView.setCoinMove2(e, t, i);
              }));
      }
      calculatePos(e, t, i, s) {
          let a = new Laya.Vector3(0, 0, 0);
          return ((a.x = t.x * (1 - e) * (1 - e) + 2 * i.x * (1 - e) * e + s.x * e * e),
              (a.y = t.y * (1 - e) * (1 - e) + 2 * i.y * (1 - e) * e + s.y * e * e),
              (a.z = t.z * (1 - e) * (1 - e) + 2 * i.z * (1 - e) * e + s.z * e * e),
              a);
      }
      pointInBox(e, t) {
          let i = new Laya.Vector3(0, 0, 0);
          t.transform.getForward(i), Laya.Vector3.normalize(i.clone(), i);
          let s = t.transform.position.clone(), a = new Laya.Vector3(0, 0, 0);
          Laya.Vector3.subtract(e, s, a);
          let o = Laya.Vector3.dot(i, a), n = new Laya.Vector3(0, 0, 0);
          t.transform.getRight(n), Laya.Vector3.normalize(n.clone(), n);
          let r = Laya.Vector3.dot(n, a), l = t.transform.localScale.clone();
          return Math.abs(r) < l.x / 2 && Math.abs(o) < l.z / 2;
      }
      pointInBox2(e, t, i) {
          let s = t.transform.position.clone(), a = new Laya.Vector3(0, 0, 0);
          Laya.Vector3.subtract(e, s, a);
          let o = new Laya.Vector3(0, 0, 0);
          t.transform.getForward(o), Laya.Vector3.normalize(o.clone(), o);
          let n = Laya.Vector3.dot(o, a), r = new Laya.Vector3(0, 0, 0);
          t.transform.getRight(r), Laya.Vector3.normalize(r.clone(), r);
          let l = Laya.Vector3.dot(r, a), h = new Laya.Vector3(0, 0, 0);
          t.transform.getUp(h), Laya.Vector3.normalize(h.clone(), h);
          let c = Laya.Vector3.dot(h, a);
          return ((i = t.transform.localScale.clone()),
              Math.abs(l) < i.x / 2 && Math.abs(c) < i.y / 2 && Math.abs(n) < i.z / 2);
      }
      calculateBoxByBox(e, t) {
          return !(!this.calculateBoxByBoxEx(e, t) && !this.calculateBoxByBoxEx(t, e));
      }
      calculateBoxByBoxEx(e, t) {
          let i = e.transform.position.clone(), s = new Laya.Vector3(), a = new Laya.Vector3(), o = new Laya.Vector3();
          e.transform.getForward(s),
              e.transform.getRight(o),
              e.transform.getUp(a),
              Laya.Vector3.normalize(s, s),
              Laya.Vector3.normalize(a, a),
              Laya.Vector3.normalize(o, o);
          let n = e.transform.localScale.clone(), r = new Laya.Vector3();
          Laya.Vector3.scale(n, 0.5, r);
          let l = new Laya.Vector3(), h = new Laya.Vector3(), c = new Laya.Vector3();
          Laya.Vector3.scale(s, r.z, l), Laya.Vector3.scale(a, r.y, h), Laya.Vector3.scale(o, r.x, c);
          let d = [];
          for (let e = 0; e < 8; ++e)
              if (((d[e] = new Laya.Vector3(i.x, i.y, i.z)),
                  e > 3
                      ? ((d[e].x += l.x), (d[e].y += l.y), (d[e].z += l.z))
                      : ((d[e].x -= l.x), (d[e].y -= l.y), (d[e].z -= l.z)),
                  e % 4 > 1
                      ? ((d[e].x += h.x), (d[e].y += h.y), (d[e].z += h.z))
                      : ((d[e].x -= h.x), (d[e].y -= h.y), (d[e].z -= h.z)),
                  e % 2 == 1
                      ? ((d[e].x += c.x), (d[e].y += c.y), (d[e].z += c.z))
                      : ((d[e].x -= c.x), (d[e].y -= c.y), (d[e].z -= c.z)),
                  this.pointInBoxCube(d[e].clone(), t, t.parent.transform.localScale.clone())))
                  return (M.soundMgr.play(Math.floor(3 * Math.random() + 9)),
                      M.gameMgr.playVibrate(!0),
                      M.gameMgr.effectMgr.playEffect(0, d[e].clone()),
                      !0);
          return !1;
      }
      pointInBoxCube(e, t, i) {
          let s = t.transform.position.clone(), a = new Laya.Vector3(0, 0, 0);
          Laya.Vector3.subtract(e, s, a);
          let o = new Laya.Vector3(0, 0, 0);
          t.transform.getForward(o), Laya.Vector3.normalize(o.clone(), o);
          let n = Laya.Vector3.dot(o, a), r = new Laya.Vector3(0, 0, 0);
          t.transform.getRight(r), Laya.Vector3.normalize(r.clone(), r);
          let l = Laya.Vector3.dot(r, a), h = new Laya.Vector3(0, 0, 0);
          t.transform.getUp(h), Laya.Vector3.normalize(h.clone(), h);
          let c = Laya.Vector3.dot(h, a), d = t.transform.localScale.clone();
          return ((i.x *= d.x),
              (i.y *= d.y),
              (i.z *= d.z),
              Math.abs(l) < i.x / 2 && Math.abs(c) < i.y / 2 && Math.abs(n) < i.z / 2);
      }
      PointToSegDist2(e, t, i) {
          let s = 0;
          (e.y = 0), (t.y = 0), (i.y = 0);
          let a = new Laya.Vector3(), o = new Laya.Vector3(), n = new Laya.Vector3();
          Laya.Vector3.subtract(i, t, o), Laya.Vector3.subtract(e, t, a), Laya.Vector3.subtract(e, i, n);
          let r = Laya.Vector3.dot(a, o);
          if (r < 0)
              return (s = Laya.Vector3.scalarLength(a));
          let l = Laya.Vector3.scalarLengthSquared(o);
          if (r > l)
              return (s = Laya.Vector3.scalarLength(n));
          let h = r / l, c = new Laya.Vector3();
          return (Laya.Vector3.lerp(t, i, h, c), Laya.Vector3.subtract(e, c, c), Laya.Vector3.scalarLength(c));
      }
  }

  class wxMgr {
      constructor() {
          this.shareStartTime = 0;
      }
      init() {
          Laya.stage.on('DEVICE_ON_HIDE', this, this.onHideEvent),
              Laya.stage.on('DEVICE_ON_SHOW', this, this.onShowEvent);
      }
      showToast(e, t) {
          if (!window.wx)
              return;
      }
      openShare(e = null, t = null, i = null) { }
      onHideEvent(e) { }
      onShowEvent(e) {
      }
      shareFailTips() {
          let e = '分享失败，分享到不同的群', t = 3 * Math.random();
          0 < t && t < 1
              ? (e = '分享失败，分享大于10人的群')
              : 1 <= t && t < 2
                  ? (e = '分享失败，分享给不同的人')
                  : 2 <= t && t < 3 && (e = '分享失败，等一下再分享'),
              this.showToast(e, 1200);
      }
  }

  class M {
      static init() {
          this._utils = new utils();
          this._commonData = new commonData();
          this._gameData = new gameData();
          this._gameMgr = new gameMgr();
          M._eventListener = new Laya.EventDispatcher();
      }
      static get glEvent() {
          return this._eventListener;
      }
      static get soundMgr() {
          return void 0 === this._soundMgr && (this._soundMgr = new soundMgr()), this._soundMgr;
      }
      static get storageMgr() {
          return void 0 === this._storageMge && (this._storageMge = new storageMgr()), this._storageMge;
      }
      static get commonData() {
          return this._commonData;
      }
      static get gameData() {
          return this._gameData;
      }
      static get utils() {
          return this._utils;
      }
      static get gameMgr() {
          return this._gameMgr;
      }
      static get configMgr() {
          return void 0 === this._configMgr && (this._configMgr = new configMgr()), this._configMgr;
      }
      static get rankMgr() {
          return void 0 === this._rankMgr && (this._rankMgr = new rankMgr()), this._rankMgr;
      }
      static get wxMgr() {
          return void 0 === this._wxMgr && (this._wxMgr = new wxMgr()), this._wxMgr;
      }
      static get resourceMgr() {
          return (void 0 === this._resourceMgr && (this._resourceMgr = new resourceMgr()), this._resourceMgr);
      }
      static get uiMgr() {
          return this._uiMgr || (this._uiMgr = new uiMgr()), this._uiMgr;
      }
  }

  const ad = {
      banner_id: "ca-app-pub-2476175026271293/9735815213",
      interstitial_id: "ca-app-pub-2476175026271293/9428693457",
      reward_id: "ca-app-pub-2476175026271293/2701016465",
      debug_mode: false,
      test_device_id: "8AD5A38069694FF0BE49FA545C67F674",
      banner_location: 2,
      custom_banner_location: {
          width: -1,
          gravity: 80
      }
  };
  class CPKHelp {
      static adInit(success) {
          ad.success = (code) => {
              if (code == 10000) {
                  CPKHelp.ininted = true;
                  success && success();
              }
          };
          window.adInit && window.adInit(ad);
      }
      static showBanner(success, fail) {
          CPKHelp.ininted && window.adShow({
              ad_type: 1,
              success: success,
              fail: fail
          });
      }
      static showInterstitialAd(success, fail) {
          if (!CPKHelp.canshow) {
              return;
          }
          CPKHelp.ininted && window.adShow({
              ad_type: 2,
              success: success,
              fail: fail
          });
          CPKHelp.canshow = false;
          setTimeout(() => {
              CPKHelp.canshow = true;
          }, 1000 * 60);
      }
      static playVideo(success, fail) {
          CPKHelp.ininted && window.adShow({
              ad_type: 3,
              success: success,
              fail: fail
          });
      }
      static hideBanner(success, fail) {
          CPKHelp.ininted && window.adClose && window.adClose({
              ad_type: 1,
              success: success,
              fail: fail
          });
      }
  }
  CPKHelp.ininted = false;
  CPKHelp.endCount = 0;
  CPKHelp.canshow = true;

  var BannerSize;
  (function (BannerSize) {
      BannerSize[BannerSize["BANNER_SIZE_320_50"] = 0] = "BANNER_SIZE_320_50";
      BannerSize[BannerSize["BANNER_SIZE_320_100"] = 1] = "BANNER_SIZE_320_100";
      BannerSize[BannerSize["BANNER_SIZE_300_250"] = 2] = "BANNER_SIZE_300_250";
      BannerSize[BannerSize["BANNER_SIZE_360_57"] = 3] = "BANNER_SIZE_360_57";
      BannerSize[BannerSize["BANNER_SIZE_360_144"] = 4] = "BANNER_SIZE_360_144";
      BannerSize[BannerSize["BANNER_SIZE_SMART"] = 5] = "BANNER_SIZE_SMART";
  })(BannerSize || (BannerSize = {}));
  var NativeType;
  (function (NativeType) {
      NativeType[NativeType["small"] = 0] = "small";
      NativeType[NativeType["three"] = 1] = "three";
      NativeType[NativeType["Big"] = 2] = "Big";
  })(NativeType || (NativeType = {}));
  const ReportEvent = {
      first_load: "first_load",
      first_load_complete: "first_load_complete",
      first_start: "first_start",
      first_settlement: "first_settlement"
  };
  class Android {
      constructor() {
          this.isnewUser = true;
          this.openAd = true;
          this.moreInterstitialAd = false;
          this.first_open = "first_open";
          this.success = 0;
          this.failed = 0;
          if (window.conch)
              this.isnewUser = this.getISNewUser();
      }
      start() {
          this.firstopenTime = Laya.LocalStorage.getItem(this.first_open);
          setInterval(this.check.bind(this), 1000);
      }
      check() {
          if (!this.firstopenTime) {
              this.firstopenTime = new Date().getTime();
              Laya.LocalStorage.setItem(this.first_open, this.firstopenTime + "");
          }
          else {
              let now = new Date().getTime();
              if (now - Number(this.firstopenTime) >= 12 * 60 * 60 * 1000) {
                  this.moreInterstitialAd = true;
              }
          }
      }
      getISNewUser() {
          if (!Laya.Browser.onAndroid) {
              return;
          }
          if (window["android"])
              return window["android"].getISNewUser();
      }
      report(eventId) {
          var first_load = Laya.LocalStorage.getItem(eventId);
          if (!first_load) {
              Laya.LocalStorage.setItem(eventId, "1");
              if (!window.conch) {
                  return;
              }
              if (window["android"])
                  window["android"].report(eventId);
          }
      }
      vibrateShort(time = 500) {
          if (!window.conch) {
              console.log('vibrateShort');
              return;
          }
          if (window["android"])
              window["android"].vibrateShort(time);
      }
      showNativeAd(type, bottom = 0) {
          if (!window.conch) {
              console.log('showNativeAd');
              return;
          }
          if (window["android"])
              window["android"].showNative(type, Math.floor(bottom));
      }
      hideNativeAd(type) {
          if (!window.conch) {
              console.log('hideNativeAd');
              return;
          }
          if (window["android"])
              window["android"].hideNative(type);
      }
      showInstream(left, top) {
          if (!window.conch) {
              console.log('showInstream');
              return;
          }
          if (window["android"])
              window["android"].showInstream(left, top);
      }
      hideInstream() {
          if (!window.conch) {
              console.log('hideInstream');
              return;
          }
          if (window["android"])
              window["android"].hideInstream();
      }
      showInterstitialAd(after_12 = false) {
          if (after_12 && !this.moreInterstitialAd) {
              return;
          }
          if (!window.conch) {
              console.log('showInterstitialAd');
              return;
          }
          if (window["android"])
              window["android"].showInterstitialAd();
      }
      pause() {
          Laya.stage.renderingEnabled = false;
          Laya.updateTimer.pause();
          Laya.physicsTimer.pause();
      }
      resume() {
          Laya.stage.renderingEnabled = true;
          Laya.updateTimer.resume();
          Laya.physicsTimer.resume();
      }
      showBannerAd(size) {
          if (!window.conch) {
              console.log('showBannerAd');
              return;
          }
          if (window["android"])
              window["android"].showBanner(size);
      }
      hideBannerAd() {
          if (!window.conch) {
              console.log('hideBannerAd');
              return;
          }
          if (window["android"])
              window["android"].hideBanner();
      }
      playVideo(callback, errCallback) {
          if (CPKHelp.ininted) {
              CPKHelp.playVideo((code) => {
                  if (code == 10002) {
                      callback && callback(true);
                  }
                  else {
                      callback && callback(false);
                  }
              }, errCallback);
              return;
          }
          this.videoSuccess = callback;
          this.videoError = errCallback;
          M.uiMgr.showToast("Ad is loading...", 2000);
          if (!window.conch) {
              this.VideoCallBack(1);
              return;
          }
          if (window["android"])
              window["android"].showReward();
          this.VideoCallBack(1);
          callback && callback(true);
      }
      VideoCallBack(code) {
          setTimeout(() => {
              switch (code) {
                  case 1:
                      this.videoSuccess && this.videoSuccess(true);
                      break;
                  case -1:
                      this.videoError && this.videoError();
                      M.uiMgr.showToast('Ad loading fail ! please try again later.', 2000);
                      break;
                  case 0:
                      this.videoSuccess && this.videoSuccess(false);
                      break;
              }
              this.videoSuccess = null;
              this.videoError = null;
          }, 200);
      }
  }
  const platform = new Android();
  window.JSAndroid = platform;

  class I extends Laya.Script {
      onAwake() {
          super.onAwake();
          this.initData();
          this.initDataBase();
          this.initUI();
          this.initEvent();
      }
      onClosed() {
          Laya.timer.clearAll(this);
          M.glEvent.offAllCaller(this);
      }
      initData() { }
      initDataBase() { }
      initUI() { }
      initEvent() { }
      getChild(e, t) {
          return t || (t = this), t.getChildByName(e);
      }
  }

  class luckyRotate extends I {
      constructor() {
          super();
          this.isAni = false;
          this.coinValue = null;
          (this.moveValue = 0),
              (this.sinVal = 0),
              (this.param = 0),
              (this.angle = 0),
              (this.lastAngle = 0),
              (this.isAni = !1),
              (this.lastRan = 6),
              (this.arr = [1e4, 500, 2e4, 1e3, 5e4, 500]);
      }
      onAwake() {
          super.onAwake();
      }
      initUI() {
          let e = this.getChild('topUI', this.owner), t = this.getChild('middleUI', this.owner), i = this.getChild('bottomUI', this.owner);
          (this.coinValue = e.getChildByName('coinBg').getChildByName('value')),
              (this.coinValue.text = M.commonData.userCoin + ''),
              (this.btnClose = this.getChild('btnBack', e)),
              (this.btnFree = this.getChild('btnVideo', i)),
              (this.count = this.getChild('lblLimit', i)),
              (this.rotateImg = this.getChild('disk', t));
          let s = M.storageMgr.getLuckyCount();
          this.count.text = s + '/5';
      }
      initEvent() {
          M.utils.addClickEvent(this.btnClose, this, this.onCloseClick),
              M.utils.addClickEvent(this.btnFree, this, this.onFreeClick);
      }
      setAni(e, t, i = !1) {
          let s = this.getChild('middleUI', this.owner);
          (this.moveValue = e),
              (Laya.Tween.to(this, {
                  moveValue: t
              }, 300, Laya.Ease.quadInOut, new Laya.Handler(this, function () {
                  i && Laya.Scene.close('views/disk.scene');
              })).update = new Laya.Handler(this, function () {
                  s.scale(this.moveValue, this.moveValue);
              }));
      }
      onFreeClick() {
          if (this.isAni)
              return;
          let e = M.storageMgr.getLuckyCount();
          if (e < 5) {
              platform.playVideo((isend) => {
                  if (isend) {
                      this.owner.scene.mouseEnabled = !1;
                      this.rotateAni();
                      e++;
                      M.storageMgr.setLuckyCount(e);
                      this.count.text = e + '/5';
                  }
              });
          }
          else
              M.uiMgr.showToast('Number of times used up today', 2e3);
      }
      onUpdate() { }
      rotateAni() {
          if (this.isAni)
              return;
          this.isAni = true;
          this.angle = this.lastAngle;
          let e = 2 * Math.floor(3 * Math.random()), t = 1080 + 60 * e + this.lastAngle + 60 * (6 - this.lastRan);
          this.lastRan = e;
          let i = 0;
          Laya.Tween.to(this, {
              angle: t
          }, 3e3, Laya.Ease.quadInOut, new Laya.Handler(this, function () {
              this.lastAngle = t;
              this.isAni = false;
              let s = this.arr[e];
              M.commonData.userCoin += s;
              M.storageMgr.setAwardGold(M.commonData.userCoin);
              M.uiMgr.showToast('+' + s + 'Coins', 2000);
              M.glEvent.event('update_coin');
              this.owner.scene.mouseEnabled = true;
              (this.coinValue.text = M.commonData.userCoin + '');
          })).update = new Laya.Handler(this, function () {
              this.rotateImg.rotation = this.angle;
          });
      }
      showGoldAni() {
          let e = new Laya.Point(0, 0);
          (e.x = Laya.stage.width / 2), (e.y = Laya.stage.height / 2 - 100);
          let t = new Laya.Point(566, 135);
      }
      onCloseClick() {
          console.log("onCloseClick", this.isAni);
          if (!this.isAni) {
              Laya.Scene.close('views/disk.scene');
              M.glEvent.event('init_scene');
              platform.showInterstitialAd(true);
          }
      }
  }

  class NativeAd extends Laya.Script {
      constructor() { super(); }
      onEnable() {
          let body = this.owner;
          let p = new Laya.Point(0, 0);
          body.localToGlobal(p);
          platform.showNativeAd(NativeType.Big, Laya.Browser.clientHeight - (p.y + body.height) * Laya.Browser.clientWidth / GameConfig.width);
          platform.showBannerAd(BannerSize.BANNER_SIZE_360_144);
      }
      onDisable() {
          platform.hideNativeAd(NativeType.Big);
          platform.hideBannerAd();
      }
  }

  class FailView extends I {
      constructor() {
          super();
          this.endValue = 0;
      }
      onAwake() {
          super.onAwake();
      }
      onOpened() {
          this.isStartTimer = !0;
      }
      initUI() {
          platform.report(ReportEvent.first_settlement);
          (this.endWithe = this.getChild('endWithe', this.owner)), (this.endWithe.visible = !1);
          let e = this.getChild('bottomUI', this.owner);
          this.btnAgain = this.getChild('btnAgain', e),
              (M.gameData.gameCoin = 0),
              M.commonData.freeSkinCount++;
      }
      initEvent() {
          M.utils.addClickEvent(this.btnAgain, this, this.onAgainClick);
      }
      updateScore() {
          (this.coinValue.text = M.commonData.userCoin + ''),
              M.storageMgr.setAwardGold(M.commonData.userCoin);
      }
      onAgainClick() {
          M.gameMgr.gameReset();
          this.endWhiteAni();
      }
      endWhiteAni() {
          (this.endValue = 0),
              (this.endWithe.alpha = 0),
              (this.endWithe.visible = !0),
              (Laya.Tween.to(this, {
                  endValue: 1
              }, 300, Laya.Ease.linearIn, new Laya.Handler(this, () => {
                  Laya.timer.once(700, this, () => {
                      let owner = this.owner;
                      owner.close();
                      platform.showInterstitialAd();
                      Laya.Scene.open('views/home.scene', !1);
                  });
              })).update = new Laya.Handler(this, () => {
                  this.endWithe.alpha = this.endValue;
              }));
      }
  }

  class FreeSkin extends I {
      constructor() {
          super(),
              (this.skinId = 0),
              (this.iconArr = []),
              (this.tipArr = [
                  'Opening number +3',
                  'Resurrection time -1s',
                  'Speed +5%',
                  'Opening number +5, Speed +5%',
                  'Opening number +10',
                  'Opening number +10, Speed +5%',
                  'Resurrection time -2s, Speed +5%',
                  'Opening number +10, Speed +10%',
                  'Opening number +10, Resurrection time -2s',
                  'Opening number +15, Speed +10%',
                  'Opening number +30'
              ]),
              (this.bClose = !1),
              (this.model = null);
      }
      onAwake() {
          super.onAwake();
      }
      initUI() {
          this.getChild('topUI', this.owner);
          let e = this.getChild('bottomUI', this.owner), t = this.getChild('middleUI', this.owner);
          (this.videoBtn = this.getChild('selectBtn', e)),
              (this.skipBtn = this.getChild('btnStart', e)),
              (this.light = this.getChild('light', t)),
              (this.skinId = Math.floor(3 * Math.random()) + 9),
              (this.getChild('tipTxt', e).text = this.tipArr[this.skinId - 1]),
              this.initScene(),
              this.show3dScene(!0);
          platform.showBannerAd(BannerSize.BANNER_SIZE_360_144);
      }
      initEvent() {
          M.utils.addClickEvent(this.videoBtn, this, this.onVideoClick),
              M.utils.addClickEvent(this.skipBtn, this, this.onSkipBtnClick);
      }
      onVideoClick() {
          this.owner.scene.mouseEnabled = false;
          platform.playVideo((isend) => {
              if (isend) {
                  M.gameData.levelCount++;
                  M.commonData.freeSkinId = this.skinId;
                  M.gameMgr.playerLg.changeSkin(this.skinId);
                  this.closeView();
              }
              this.owner.scene.mouseEnabled = true;
          }, () => {
              this.owner.scene.mouseEnabled = true;
          });
      }
      onSkipBtnClick() {
          this.closeView();
      }
      closeView() {
          platform.hideBannerAd();
          this.bClose ||
              ((this.bClose = !0),
                  this.owner.close(),
                  this.show3dScene(!1),
                  Laya.Scene.open('views/ggame.scene', !1));
      }
      onUpdate() {
          this.light.rotation += 0.5;
      }
      initScene() {
          let e, t;
          if (M.commonData.showScene)
              (M.commonData.showScene.active = !0), (e = M.commonData.showScene), Laya.stage.addChild(e);
          else {
              let i = (e = Laya.stage.addChild(new Laya.Scene3D())).addChild(new Laya.DirectionLight());
              (i.color = new Laya.Vector3(128 / 255, 128 / 255, 128 / 255)),
                  (e.ambientSphericalHarmonicsIntensity = 1),
                  (e.ambientColor = new Laya.Vector3(233 / 255, 220 / 255, 0.8)),
                  (i.intensity = 1),
                  (i.transform.localRotationEuler = new Laya.Vector3(11, -17, 0)),
                  ((t = e.addChild(new Laya.Camera(0, 0.1, 100))).name = 'mainCamera'),
                  t.transform.translate(new Laya.Vector3(0, 2, 5)),
                  t.transform.rotate(new Laya.Vector3(-10, 0, 0), !0, !1),
                  (t.clearFlag = 2),
                  (M.commonData.showScene = e);
          }
      }
      setRoleSkin(e) {
          this.model && (this.model.getChildByName('man')._render.material = M.gameMgr.roleMatArr[e + 1]);
      }
      show3dScene(e) {
          e
              ? ((this.model = M.gameMgr.showModel),
                  this.model &&
                      (this.setRoleSkin(this.skinId),
                          (M.commonData.showScene.active = !0),
                          M.commonData.showScene.addChild(this.model),
                          (this.model.active = !0),
                          (this.model.transform.localScale = new Laya.Vector3(1.2, 1.2, 1.2)),
                          (this.model.transform.position = new Laya.Vector3(0, 0.2, 0))))
              : (this.model && this.model.removeSelf(),
                  Laya.timer.clearAll(this),
                  (M.commonData.showScene.active = !1));
      }
  }

  class infoBox extends Laya.Script {
      constructor() {
          super(), (this.bAni = !1);
      }
      init(e) {
          (this.single = e), (this.single.visible = !1);
      }
      showAni1() {
          (this.bAni = !0), (this.single.x = 1e3), (this.single.visible = !0);
          let e = {
              value: 0
          };
          Laya.Tween.to(e, {
              value: 1
          }, 500, Laya.Ease.backOut, new Laya.Handler(this, () => {
              Laya.timer.once(2e3, this, this.showAni2);
          })).update = new Laya.Handler(this, () => {
              let t = 1e3 * (1 - e.value) + 375 * e.value;
              this.single.x = t;
          });
      }
      showAni2() {
          let e = {
              value: 0
          };
          Laya.Tween.to(e, {
              value: 1
          }, 1e3, Laya.Ease.linearIn, new Laya.Handler(this, () => {
              (this.single.visible = !1), (this.single.alpha = 1), (this.bAni = !1);
          })).update = new Laya.Handler(this, () => {
              this.single.alpha = 1 - e.value;
          });
      }
  }

  class B extends Laya.Script {
      constructor() {
          super(),
              (this.index = 0),
              (this.isMove = !1),
              (this.moveValue = 0),
              (this.start = null),
              (this.end = null);
      }
      init(e, t) {
          (this.index = t), (this.single = e);
      }
      setMove(e, t, i, s, a = null, o = null) {
          (this.isMove = e),
              (this.start = t),
              (this.end = i),
              (this.moveValue = 0),
              (this.single.visible = !0);
          let n = new Laya.Vector2(0, 0);
          Laya.Tween.to(this, {
              moveValue: 1
          }, 800, Laya.Ease.quadInOut, new Laya.Handler(this, function () {
              (this.single.visible = !1),
                  M.gameMgr.playVibrate(!0),
                  M.gameMgr.isOver
                      ? ((M.commonData.userCoin += s), a && o && a(o))
                      : ((M.gameData.gameCoin += s), M.commonData.GGame.setTipShowArr(this.index));
          })).update = new Laya.Handler(this, function () {
              (n.x = this.start.x * (1 - this.moveValue) + this.end.x * this.moveValue),
                  (n.y = this.start.y * (1 - this.moveValue) + this.end.y * this.moveValue),
                  this.single.pos(n.x, n.y);
          });
      }
      onUpdate() { }
  }

  class GGame extends I {
      constructor() {
          super(),
              (this.addTipArr = []),
              (this.addTipShow = []),
              (this.addTipArr2 = []),
              (this.addTipShow2 = []),
              (this.addTipOffy = []),
              (this.peopleArr = []),
              (this.directionArr = []),
              (this.infoArr = []),
              (this.rankArr = []),
              (this.nameArr = []),
              (this.gameTime = 0),
              (this.tempArr = []),
              (this.arrowsTime = 0),
              (this.theta = 0),
              (this.shakeCount = 0);
      }
      initData() { }
      initUI() {
          platform.showNativeAd(NativeType.small);
          M.commonData.GGame = this;
          let e = this.getChild('topUI', this.owner), t = this.getChild('middleUI', this.owner);
          let bottomUI = this.getChild('bottomUI', this.owner);
          this.initName(),
              (this.addTipBox2 = this.getChild('addTip', t)),
              (this.addTipShow2.length = 6),
              (this.addTipArr2.length = 6),
              (this.addTipOffy.length = 6);
          for (let e = 0; e < 6; ++e) {
              (this.addTipShow2[e] = !1), (this.addTipOffy[e] = 0);
              let t = this.addTipBox2.getChildAt(e);
              (t.visible = !1), (this.addTipArr2[e] = t);
          }
          (this.addTipBox = this.getChild('addCoin', t)),
              (this.addTipShow.length = 12),
              (this.addTipArr.length = 12);
          for (let e = 0; e < 12; ++e) {
              this.addTipShow[e] = !1;
              let t = this.addTipBox.getChildAt(e);
              (t.visible = !1), t.addComponent(B).init(t, e), (this.addTipArr[e] = t);
          }
          this.infoBox = this.getChild('infoBox', t);
          for (let e = 0; e < this.infoBox.numChildren; ++e) {
              (this.infoArr[e] = this.infoBox.getChildAt(e)),
                  this.infoArr[e].addComponent(infoBox).init(this.infoArr[e]);
          }
          (this.peopleBox = this.getChild('peopleBox', t)),
              (this.directionBox = this.getChild('direction', t));
          for (let e = 0; e < this.peopleBox.numChildren; ++e) {
              let t = this.peopleBox.getChildAt(e);
              (t.visible = !1), (this.peopleArr[e] = t);
          }
          for (let e = 0; e < this.directionBox.numChildren; ++e) {
              let t = this.directionBox.getChildAt(e);
              (t.visible = !1), (this.directionArr[e] = t);
          }
          this.rankBox = this.getChild('rankBox', e);
          let i = this.getChild('timeBg', e);
          (this.timeTxt = this.getChild('txt', i)),
              (this.gameEnd = this.getChild('gameEnd', bottomUI)),
              (this.gameEnd.visible = !1),
              (this.gameEndBtn = this.getChild('btnNext', this.gameEnd));
          for (let e = 0; e < this.rankBox.numChildren; ++e)
              this.rankArr[e] = this.rankBox.getChildAt(e);
          (this.circleBox = this.getChild('circleBox', t)),
              (this.circleBox.visible = !1),
              (this.coinBg = this.getChild('coinBg', e)),
              (this.userCoin = this.getChild('value', this.coinBg)),
              (this.userCoin.text = '0'),
              (this.leftTxt = this.getChild('leftTxt', e)),
              this.updateScore(),
              Laya.timer.loop(100, this, this.updateScore),
              this.onGamePlayEvent();
      }
      initName() {
          this.nameArr[0] = 'you';
          for (let e = 1; e < 8; ++e)
              this.nameArr[e] = Math.floor(Math.random() * M.commonData.nameArr.length);
      }
      touchImgClick() {
          M.gameMgr.gameOver();
      }
      hideHpBox() { }
      showVictory() {
          this.onOpenWinView();
      }
      showChangeInfo(e, t) {
          let i = 'you';
          e > 0 && (i = M.commonData.nameArr[this.nameArr[e]]),
              this.showTipInfo(i + ' have unlocked ' + t);
      }
      killTip(e, t) {
          let i = 'you', s = 'you';
          e > 0 && (i = M.commonData.nameArr[this.nameArr[e]]),
              t > 0 && (s = M.commonData.nameArr[this.nameArr[t]]),
              this.showTipInfo(i + ' have eaten ' + s), (i == 'you' && platform.vibrateShort());
      }
      showTipInfo(e) {
          for (let e = 0; e < this.infoArr.length; ++e)
              this.infoArr[e].visible = !1;
          for (let t = 0; t < this.infoArr.length; ++t) {
              let i = this.infoArr[t].getComponent(infoBox);
              if (!i.bAni) {
                  (this.infoArr[t].getChildAt(0).text = e), i.showAni1();
                  break;
              }
          }
      }
      setGameCoin() {
          this.userCoin.text = M.gameData.gameCoin + '';
      }
      gameStartSet() {
          M.gameMgr.gameStart(), Laya.timer.loop(1e3, this, this.setGameTime);
      }
      setGameTime() {
          this.gameTime++,
              this.gameTime >= 90 && (M.gameMgr.gameEndSet(!0), Laya.timer.clear(this, this.setGameTime));
          let e = '', t = 90 - this.gameTime;
          if (t == 60) {
              platform.hideNativeAd(NativeType.small);
              platform.showBannerAd(BannerSize.BANNER_SIZE_360_144);
          }
          else if (t == 30) {
              platform.hideBannerAd();
              platform.showNativeAd(NativeType.small);
          }
          (e = t >= 60 ? '1:' : '0:'), (e += (t %= 60) > 9 ? t : '0' + t), (this.timeTxt.text = e);
      }
      updateRank() {
          let e = [], t = M.gameData.playerArr;
          for (let i = 0; i < 8; ++i)
              (e[i] = {
                  id: i,
                  score: t[i].lg.peopleCount,
                  time: t[i].deadTime
              }),
                  t[i].isActive || (t[i].score = -1);
          for (let t = 0; t < 7; ++t)
              for (let i = t + 1; i < 8; ++i)
                  if (e[t].score < e[i].score) {
                      let s = e[t];
                      (e[t] = e[i]), (e[i] = s);
                  }
                  else if (e[t].score == e[i].score && e[t].deadTime < e[i].deadTime) {
                      let s = e[t];
                      (e[t] = e[i]), (e[i] = s);
                  }
          for (let i = 0; i < 3; ++i) {
              let s = e[i].score + 1;
              t[e[i].id].isActive || 1 != s || (s = 0),
                  (this.rankArr[i].getChildByName('num').text = s + ''),
                  0 == e[i].id
                      ? (this.rankArr[i].getChildByName('name').text = 'you')
                      : (this.rankArr[i].getChildByName('name').text =
                          M.commonData.nameArr[this.nameArr[e[i].id]]);
          }
          this.tempArr = e;
      }
      onLateUpdate() {
          this.showPeopleCount();
      }
      showPeopleCount() {
          for (let e = 0; e < this.peopleArr.length; ++e)
              this.peopleArr[e].visible = !1;
          for (let e = 0; e < this.directionArr.length; ++e)
              this.directionArr[e].visible = !1;
          this.setPeopleCount(0);
          for (let e = 0; e < 4; ++e)
              0 == this.tempArr[e].id || this.setPeopleCount(this.tempArr[e].id);
      }
      setPeopleCount(e) {
          let t = M.gameData.playerArr;
          if (!t[e].lg.isMove || t[e].lg.peopleCount < 0)
              return;
          let i = t[e].item.transform.position.clone();
          i.y += 3;
          let s = i.clone();
          M.gameMgr.camera.viewport.project(i, M.gameMgr.camera.projectionViewMatrix, s);
          let a = 1;
          s.w < 0 && (a = -1);
          let o = new Laya.Vector2(s.x * a, s.y * a - Laya.stage.height / 2);
          e > 0 &&
              (o.x < 0 ||
                  o.x > Laya.stage.width ||
                  o.y < -Laya.stage.height / 2 ||
                  o.y > Laya.stage.height / 2)
              ? (o.x < 70 && (o.x = 70),
                  o.x > Laya.stage.width - 70 && (o.x = Laya.stage.width - 70),
                  o.y < -Laya.stage.height / 2 + 100 && (o.y = -Laya.stage.height / 2 + 100),
                  o.y > Laya.stage.height / 2 - 100 && (o.y = Laya.stage.height / 2 - 100),
                  (this.directionArr[e - 1].visible = !0),
                  this.directionArr[e - 1].pos(o.x, o.y),
                  (this.directionArr[e - 1].getChildByName('txt').text = t[e].lg.peopleCount + 1 + ''),
                  this.setDirectionPos(e - 1))
              : ((this.peopleArr[e].visible = !0),
                  this.peopleArr[e].pos(s.x, s.y - Laya.stage.height / 2),
                  (this.peopleArr[e].getChildByName('count').text = t[e].lg.peopleCount + 1 + ''),
                  (this.peopleArr[e].getChildByName('name').text =
                      0 == e ? 'you' : M.commonData.nameArr[this.nameArr[e]]));
      }
      setDirectionPos(e) {
          let t = this.directionArr[e], i = t.getChildByName('img'), s = new Laya.Vector2(t.x - Laya.stage.width / 2, t.y), a = Math.sqrt(s.x * s.x + s.y * s.y);
          (s.x = t.width / 2 + (60 * s.x) / a),
              (s.y = t.height / 2 + ((60 * s.y) / a) * 0.8),
              (i.x = s.x),
              (i.y = s.y),
              (i.rotation = (180 / Math.PI) * Math.atan2(t.y, t.x - Laya.stage.width / 2) + 90);
      }
      setTipShowArr(e) {
          this.addTipShow[e] = !1;
      }
      getHitIndex() {
          for (let e = 0; e < 12; ++e)
              if (!this.addTipShow[e])
                  return (this.addTipShow[e] = !0), e;
          return -1;
      }
      showAddUi(e, t) {
          let i = this.getHitIndex();
          if (i > -1) {
              let s = this.addTipArr[i], a = e.clone();
              (s.visible = !0),
                  M.gameMgr.camera.viewport.project(e, M.gameMgr.camera.projectionViewMatrix, a);
              let o = new Laya.Vector2(a.x / Laya.stage.clientScaleX, a.y / Laya.stage.clientScaleY - Laya.stage.height / 2), n = new Laya.Vector2(this.coinBg.x + 6, this.coinBg.y - Laya.stage.height / 2 - 8);
              s.pos(o.x, o.y), s.getComponent(B).setMove(!0, o, n, t), M.soundMgr.play(12);
          }
          else
              M.gameData.gameCoin += t;
      }
      showGoldAni() {
      }
      setCircleBox(e, t) {
          this.circleBox.visible = !1;
          let i = this.getChild('img1', this.circleBox), s = this.getChild('img2', this.circleBox);
          i.pos(e.x, e.y - Laya.stage.height / 2);
          let a = t.x - e.x, o = t.y - e.y, n = Math.sqrt(a * a + o * o);
          n > 130 && ((a = (130 * a) / n), (o = (130 * o) / n)),
              s.pos(e.x + a, e.y + o - Laya.stage.height / 2),
              M.gameMgr.playerLg.setPlayerMove(a, o);
      }
      initEvent() {
          M.glEvent.on('over_game_event', this, this.onGameOverEvent),
              M.glEvent.on('init_game_event', this, this.onGameInitEvent),
              M.utils.addClickEvent(this.gameEndBtn, this, this.gameVictory);
      }
      gameVictory() {
          M.gameMgr.gameOver();
          Laya.Scene.open('views/success.scene', !1);
      }
      onUpdate() {
          for (let e = 0; e < 6; ++e)
              if (this.addTipShow2[e]) {
                  let t = this.addTipArr2[e];
                  if (t.y > this.addTipOffy[e]) {
                      t.y -= 0.15 * Laya.timer.delta;
                      let i = t.y - this.addTipOffy[e];
                      i < 30 && (t.alpha = i / 30);
                  }
                  else
                      (t.visible = !1), (this.addTipShow2[e] = !1);
              }
      }
      getHitIndex2() {
          for (let e = 0; e < 6; ++e)
              if (!this.addTipShow2[e])
                  return (this.addTipShow2[e] = !0), e;
          return -1;
      }
      showAddUi2(e) {
          let t = this.getHitIndex2();
          if (t > -1) {
              let i = this.addTipArr2[t], s = this.peopleArr[0], a = new Laya.Vector2(s.x + 85, s.y - 10);
              (a.x += 10 * Math.random() + 5),
                  (a.y += 10 * Math.random() - 5),
                  i.pos(a.x, a.y),
                  (this.addTipOffy[t] = a.y - 60),
                  (i.visible = !0),
                  (i.alpha = 1),
                  (i.text = e);
          }
      }
      updateScore() {
          this.userCoin.text = M.gameData.gameCoin + '';
          let e = M.gameData.playerArr, t = 8;
          for (let i = 0; i < e.length; ++i)
              !e[i].isActive && e[i].lg.revivalCount > 0 && t--;
          (this.leftTxt.getChildAt(0).text = t + ' / 8'), this.updateRank();
      }
      onClosed() {
          platform.hideNativeAd(NativeType.small);
          Laya.timer.clearAll(this), M.glEvent.offAllCaller(this);
      }
      onGameOverEvent(e) {
          e && e.isVictory
              ? (M.gameMgr.setGameOver(), (M.gameData.isStart = !1), this.showVictory())
              : this.revivalFail();
      }
      showEndPage() {
          platform.hideNativeAd(NativeType.small);
          platform.showBannerAd(BannerSize.BANNER_SIZE_360_144);
          (M.commonData.userCoin += M.gameData.gameCoin),
              M.storageMgr.setAwardGold(M.commonData.userCoin),
              this.updateScore(),
              (this.gameEnd.visible = !0);
          let e = this.tempArr;
          for (let t = 0; t < e.length; ++t)
              0 == e[t].id && (M.gameData.gameCoin = 1e3 * (10 - t));
          let t = -1;
          for (let i = 0; i < 5; ++i) {
              let s = this.gameEnd.getChildByName('rank' + (i + 1)), a = e[i].score + 1;
              !M.gameData.playerArr[e[i].id].isActive && a < 2 && (a = 0),
                  (s.getChildByName('count').text = a + '');
              let o = M.configMgr.getNickInfo().avatar, n = s.getChildByName('head').mask;
              n.graphics.clear(),
                  n.graphics.drawPie(45, 45, 45, 0, 360, '00ff00'),
                  0 == e[i].id
                      ? ((s.getChildByName('name').text = 'you'),
                          (t = i),
                          (s.getChildByName('head').texture = 'ui/common/Playericon.png'))
                      : (s.getChildByName('head').loadImage(o),
                          (s.getChildByName('name').text = M.commonData.nameArr[this.nameArr[e[i].id]]));
          }
          let i = this.gameEnd.getChildByName('rank6'), s = i.getChildByName('head').mask;
          s.graphics.clear(), s.graphics.drawPie(45, 45, 45, 0, 360, '00ff00');
          let a = M.gameMgr.playerLg.showPlayerLg.peopleCount + 1;
          !M.gameData.playerArr[0].isActive && a < 2 && (a = 0),
              (i.getChildByName('count').text = a + ''),
              t < 0
                  ? ((i.getChildByName('rank').visible = !1),
                      (i.getChildByName('txt').visible = !0),
                      (i.getChildByName('txt1').visible = !1))
                  : t < 3
                      ? ((i.getChildByName('rank').visible = !0),
                          (i.getChildByName('txt').visible = !1),
                          (i.getChildByName('txt1').visible = !1),
                          (i.getChildByName('rank').skin = 'ui/common/rank/rank' + (t + 1) + '.png'))
                      : ((i.getChildByName('rank').visible = !1),
                          (i.getChildByName('txt').visible = !1),
                          (i.getChildByName('txt1').visible = !0),
                          (i.getChildByName('txt1').text = '' + (t + 1)));
      }
      revivalSet() { }
      revival() {
          M.gameMgr.isOver = !1;
      }
      revivalFail() {
          M.gameMgr.setGameOver();
          this.onOpenFailedView();
          Laya.Scene.open('views/fail.scene', !1);
      }
      onOpenWinView() {
          this.owner.close(), this.onClosed();
      }
      onOpenFailedView() {
          this.owner.close(), this.onClosed();
      }
      onGameInitEvent() { }
      onGamePlayEvent() {
          (this.getChild('topUI', this.owner).visible = !0),
              this.gameStartSet(),
              (M.commonData.bHomeBgm = !1);
          M.soundMgr.playBGM('music2'),
              (M.gameData.gameCoin = 0),
              Laya.timer.loop(200, this, this.loopShake);
      }
      loopShake() {
          this.shakeCount++,
              this.shakeCount > 2 && Laya.timer.clear(this, this.loopShake),
              M.gameMgr.playVibrate(!0);
      }
      onBackEvent() {
          this.owner.close();
      }
  }

  class HomeView extends I {
      constructor() {
          super();
          this.clickTimes = 0;
          (this.addTipArr2 = []),
              (this.addTipShow2 = []),
              (this.addTipOffy = []),
              (this.soundSkin = 'ui/common/btn_sound_'),
              (this.vibrateSkin = 'ui/common/btn_vibrate_'),
              (this.model = null),
              (this.movev = 0),
              (this.isOther = !1),
              (this.timeAdd = 0);
      }
      onAwake() {
          super.onAwake();
      }
      initUI() {
          platform.showNativeAd(NativeType.three);
          let e = this.getChild('topUI', this.owner), t = this.getChild('middleUI', this.owner), i = this.getChild('bottomUI', this.owner);
          (this.btnSound = this.getChild('btnSound', e)),
              this.setSound(M.storageMgr.isPlaySound()),
              (this.btnVibrate = this.getChild('btnVibrate', e)),
              this.setVibrate(M.storageMgr.isPlayVibrate());
          let s = this.getChild('maxBg', e);
          (this.getChild('font', s).text = 'Highest record: ' + M.storageMgr.getMaxPeople() + ''),
              (this.coinValue = e.getChildByName('coinBg').getChildByName('value')),
              (this.btnPlay = this.getChild('btnPlay', i)),
              (this.btnRotate = this.getChild('btnRotate', t)),
              (this.btnLimitReward = this.getChild('btnReward', t));
          let a = M.storageMgr.getSkinArr();
          (this.skinShopBtn = this.getChild('skinBtn', t)),
              (this.btnSpeedUp = this.getChild('btnSpeedUp', i)),
              (this.btnPeopleUp = this.getChild('btnPeopleUp', i)),
              (this.btnRevivalUp = this.getChild('btnRevivalUp', i)),
              (this.addTipBox2 = this.getChild('addTip', t)),
              (this.addTipShow2.length = 6),
              (this.addTipArr2.length = 6),
              (this.addTipOffy.length = 6);
          for (let e = 0; e < 6; ++e) {
              (this.addTipShow2[e] = !1), (this.addTipOffy[e] = 0);
              let t = this.addTipBox2.getChildAt(e);
              (t.visible = !1), (this.addTipArr2[e] = t);
          }
          if (!M.commonData.bHomeBgm) {
              M.commonData.bHomeBgm = !0;
              let e = 'music1';
              M.soundMgr.playBGM(e);
          }
          this.updateScore(), this.initScene();
      }
      initEvent() {
          M.utils.addClickEvent(this.btnVibrate, this, this.onVibrateClick),
              M.utils.addClickEvent(this.btnSound, this, this.onSoundClick),
              this.btnPlay.on(Laya.Event.MOUSE_DOWN, this, this.onPlayGameClick),
              M.utils.addClickEvent(this.skinShopBtn, this, this.onSkinShopClick),
              M.utils.addClickEvent(this.btnRotate, this, this.onRotateClick),
              M.utils.addClickEvent(this.btnLimitReward, this, this.onLimitRewardClick),
              M.utils.addClickEvent(this.btnSpeedUp, this, this.onSpeedClickUp),
              M.utils.addClickEvent(this.btnPeopleUp, this, this.onPeopleClickUp),
              M.utils.addClickEvent(this.btnRevivalUp, this, this.onRevivalClickUp),
              M.glEvent.on('update_coin', this, this.updateScore);
          M.glEvent.on('init_scene', this, this.initScene);
      }
      onRotateClick() {
          this.show3dScene(!1);
          Laya.Scene.open('views/disk.scene', !1);
      }
      onLimitRewardClick() {
          Laya.Scene.open('views/limitReward.scene', !1);
      }
      onSpeedClickUp() {
          let e = M.storageMgr.getHomeHitLevel()[0];
          let t = 5e3 + 2e3 * (e - 1);
          if (M.commonData.userCoin >= t) {
              M.commonData.userCoin -= t;
              M.storageMgr.setHomeHitLevel(0, e + 1),
                  this.updateScore(),
                  this.showAddUi2('Speed +0.1');
              return;
          }
          platform.playVideo((isend) => {
              if (isend) {
                  M.storageMgr.setHomeHitLevel(0, e + 1),
                      this.updateScore(),
                      this.showAddUi2('Speed +0.1');
              }
          });
      }
      onPeopleClickUp() {
          let e = M.storageMgr.getHomeHitLevel()[1];
          let t = 5e3 + 2e3 * (e - 1);
          if (M.commonData.userCoin >= t) {
              M.commonData.userCoin -= t;
              M.storageMgr.setHomeHitLevel(1, e + 1),
                  this.updateScore(),
                  this.showAddUi2('Opening number +1');
              return;
          }
          platform.playVideo((isend) => {
              if (isend) {
                  M.storageMgr.setHomeHitLevel(1, e + 1),
                      this.updateScore(),
                      this.showAddUi2('Opening number +1');
              }
          });
      }
      onRevivalClickUp() {
          let e = M.storageMgr.getHomeHitLevel()[2];
          let t = 5e3 + 2e3 * (e - 1);
          if (M.commonData.userCoin >= t) {
              M.commonData.userCoin -= t;
              M.storageMgr.setHomeHitLevel(2, e + 1),
                  this.updateScore(),
                  this.showAddUi2('Resurrection time-0.1s');
              return;
          }
          platform.playVideo((isend) => {
              if (isend) {
                  M.storageMgr.setHomeHitLevel(2, e + 1),
                      this.updateScore(),
                      this.showAddUi2('Resurrection time-0.1s');
              }
          });
      }
      initScene() {
          let e, t;
          if (M.commonData.showScene)
              (M.commonData.showScene.active = !0), (e = M.commonData.showScene), Laya.stage.addChild(e);
          else {
              let i = (e = Laya.stage.addChild(new Laya.Scene3D())).addChild(new Laya.DirectionLight());
              (i.color = new Laya.Vector3(1, 0.956, 0.839)),
                  (e.ambientSphericalHarmonicsIntensity = 1),
                  (e.ambientColor = new Laya.Vector3(0.8313726, 0.8313726, 0.8313726)),
                  (i.intensity = 0.6),
                  i.transform.rotate(new Laya.Vector3(10, -17, 0), !0, !1),
                  ((t = e.addChild(new Laya.Camera(0, 0.1, 100))).name = 'mainCamera'),
                  t.transform.translate(new Laya.Vector3(0, 2, 5)),
                  t.transform.rotate(new Laya.Vector3(-10, 0, 0), !0, !1),
                  (t.clearFlag = 2),
                  (M.commonData.showScene = e);
          }
          this.show3dScene(!0);
      }
      rotateFunc() {
          this.model && (this.movev += 0.04);
      }
      setRoleSkin(e) {
          this.model && (this.model.getChildByName('man')._render.material = M.gameMgr.roleMatArr[e + 1]);
      }
      show3dScene(e) {
          e
              ? ((this.model = M.gameMgr.showModel),
                  this.model &&
                      (this.setRoleSkin(M.commonData.skinId),
                          (M.commonData.showScene.active = !0),
                          M.commonData.showScene.addChild(this.model),
                          (this.model.active = !0),
                          (this.model.transform.localScale = new Laya.Vector3(1.2, 1.2, 1.2)),
                          (this.model.transform.position = new Laya.Vector3(0, 1.2, 0))))
              : (this.model && this.model.removeSelf(),
                  Laya.timer.clearAll(this),
                  (M.commonData.showScene.active = !1));
      }
      setBtnInfo() {
          let e = M.storageMgr.getHomeHitLevel(), t = e[0], i = e[1], s = e[2], a = 5e3 + 2e3 * (t - 1), o = 5e3 + 2e3 * (i - 1), n = 5e3 + 2e3 * (s - 1), r = Math.floor(10 * (t - 1)) / 100;
          (this.btnSpeedUp.getChildByName('level').text = 'lv' + t),
              (this.btnSpeedUp.getChildByName('add').text = '+' + r),
              (this.btnSpeedUp.getChildByName('coin').text = '' + a),
              M.commonData.userCoin >= a
                  ? (this.btnSpeedUp.getChildByName('btnUp').getChildAt(0).visible = !1)
                  : (this.btnSpeedUp.getChildByName('btnUp').getChildAt(0).visible = !0),
              (this.btnPeopleUp.getChildByName('level').text = 'lv' + i),
              (this.btnPeopleUp.getChildByName('add').text = '+' + (i - 1)),
              (this.btnPeopleUp.getChildByName('coin').text = '' + o),
              M.commonData.userCoin >= o
                  ? (this.btnPeopleUp.getChildByName('btnUp').getChildAt(0).visible = !1)
                  : (this.btnPeopleUp.getChildByName('btnUp').getChildAt(0).visible = !0);
          let l = Math.floor(10 * (s - 1)) / 100;
          (this.btnRevivalUp.getChildByName('level').text = 'lv' + s),
              (this.btnRevivalUp.getChildByName('add').text = '-' + l + 's'),
              (this.btnRevivalUp.getChildByName('coin').text = '' + n),
              M.commonData.userCoin >= n
                  ? (this.btnRevivalUp.getChildByName('btnUp').getChildAt(0).visible = !1)
                  : (this.btnRevivalUp.getChildByName('btnUp').getChildAt(0).visible = !0);
          console.log(e);
      }
      onClosed() {
          this.show3dScene(!1),
              M.glEvent.off('update_coin', this, this.updateScore),
              Laya.timer.clearAll(this),
              M.glEvent.offAllCaller(this);
          for (let e = 0; e < this.addTipArr2.length; ++e)
              (this.addTipArr2[e].visible = !1),
                  this.addTipArr2[e].removeSelf(),
                  this.addTipArr2[e].destroy();
          this.addTipArr2 = [];
          platform.hideNativeAd(NativeType.three);
      }
      setSound(e) {
          let t = e ? 'on.png' : 'off.png';
          if (((this.btnSound.skin = this.soundSkin + t),
              (Laya.SoundManager.muted = !e),
              M.storageMgr.setPlaySound(e),
              e)) {
              M.commonData.bHomeBgm = !0;
              let e = 'music1';
              M.soundMgr.playBGM(e);
          }
          else
              M.soundMgr.stopBGM();
      }
      setVibrate(e) {
          let t = e ? 'on.png' : 'off.png';
          (this.btnVibrate.skin = this.vibrateSkin + t), M.storageMgr.setPlayVibrate(e);
      }
      onSoundClick() {
          this.setSound(!M.storageMgr.isPlaySound());
      }
      onVibrateClick() {
          this.setVibrate(!M.storageMgr.isPlayVibrate());
      }
      onPlayGameClick() {
          this.isOther ||
              (M.gameMgr.playVibrate(!1),
                  (this.isOther = !0),
                  this.owner.close(),
                  this.onClosed(),
                  Laya.Scene.open('views/freeSkin.scene', !1));
          platform.report(ReportEvent.first_start);
          if (platform.moreInterstitialAd && ++this.clickTimes % 2 == 0) {
              platform.showInterstitialAd(true);
          }
      }
      onUpdate() {
          this.timeAdd += Laya.timer.delta / 50;
          let e = 1 + 0.1 * Math.sin(this.timeAdd);
          this.btnRotate.getChildAt(0).scale(e, e);
          for (let e = 0; e < 6; ++e)
              if (this.addTipShow2[e]) {
                  let t = this.addTipArr2[e];
                  t.y > this.addTipOffy[e]
                      ? (t.y -= 0.2 * Laya.timer.delta)
                      : ((t.visible = !1), (this.addTipShow2[e] = !1));
              }
      }
      getHitIndex2() {
          for (let e = 0; e < 6; ++e)
              if (!this.addTipShow2[e])
                  return (this.addTipShow2[e] = !0), e;
          return -1;
      }
      showAddUi2(e) {
          let t = this.getHitIndex2();
          if (t > -1) {
              let i = this.addTipArr2[t];
              (i.text = e),
                  Laya.stage.addChild(i),
                  i.pos((Laya.stage.width - i.width) / 2, 100 + Laya.stage.height / 2),
                  (this.addTipOffy[t] = Laya.stage.height / 2 - 100),
                  (i.visible = !0);
          }
      }
      onSkinShopClick() {
          this.show3dScene(!1);
          Laya.Scene.open('views/listSkin.scene', !1);
      }
      updateScore() {
          (this.coinValue.text = M.commonData.userCoin + ''),
              M.storageMgr.setAwardGold(M.commonData.userCoin),
              this.setBtnInfo();
      }
  }

  class limitReward extends I {
      constructor() {
          super(), (this.model = null), (this.movev = 0);
      }
      onAwake() {
          super.onAwake();
      }
      initData() {
          let e = this.getChild('middleUI', this.owner);
          (this.btnBack = this.getChild('btnClose', e)), (this.btnVideo = this.getChild('btnUnlock', e));
          let t = M.storageMgr.getSkinCount();
          (this.btnVideo.getChildByName('txt').text = t + '/3'), this.initScene(), this.show3dScene(!0);
      }
      initEvent() {
          M.utils.addClickEvent(this.btnBack, this, this.onBackClick),
              M.utils.addClickEvent(this.btnVideo, this, this.onVideoClick);
      }
      onBackClick() {
          this.show3dScene(!1), Laya.Scene.close('views/limitReward.scene');
          Laya.Scene.open('views/home.scene', !1);
      }
      onVideoClick() {
          let e = M.storageMgr.getSkinCount();
          if (e < 3) {
              let t = this;
              e++,
                  M.storageMgr.setSkinCount(e),
                  (t.btnVideo.getChildByName('txt').text = e + '/3'),
                  e >= 3 && M.storageMgr.unlockSkin(8);
          }
          else
              M.uiMgr.showToast('Skin unlocked', 2e3);
      }
      initScene() {
          let e, t;
          if (M.commonData.showScene)
              (M.commonData.showScene.active = !0), (e = M.commonData.showScene), Laya.stage.addChild(e);
          else {
              let i = (e = Laya.stage.addChild(new Laya.Scene3D())).addChild(new Laya.DirectionLight());
              (i.color = new Laya.Vector3(1, 0.956, 0.839)),
                  (e.ambientSphericalHarmonicsIntensity = 1),
                  (e.ambientColor = new Laya.Vector3(0.8313726, 0.8313726, 0.8313726)),
                  (i.intensity = 0.6),
                  i.transform.rotate(new Laya.Vector3(10, -17, 0), !0, !1),
                  ((t = e.addChild(new Laya.Camera(0, 0.1, 100))).name = 'mainCamera'),
                  t.transform.translate(new Laya.Vector3(0, 2, 5)),
                  t.transform.rotate(new Laya.Vector3(-10, 0, 0), !0, !1),
                  (t.clearFlag = 2),
                  (M.commonData.showScene = e);
          }
      }
      setRoleSkin(e) {
          this.model && (this.model.getChildByName('man')._render.material = M.gameMgr.roleMatArr[e + 1]);
      }
      show3dScene(e) {
          e
              ? ((this.model = M.gameMgr.showModel),
                  this.model &&
                      (this.setRoleSkin(9),
                          (M.commonData.showScene.active = !0),
                          M.commonData.showScene.addChild(this.model),
                          (this.model.active = !0),
                          (this.model.transform.localScale = new Laya.Vector3(0.6, 0.6, 0.6)),
                          (this.model.transform.position = new Laya.Vector3(0, 0.6, 0))))
              : (this.model && this.model.removeSelf(),
                  Laya.timer.clearAll(this),
                  (M.commonData.showScene.active = !1));
      }
  }

  class box extends Laya.Box {
      constructor() {
          super(), (this.item = null), (this.icon = null), this.initItem();
      }
      onDisable() { }
      initItem() {
          box.appPrefab = Laya.loader.getRes('prefab/skinItem.json');
          let e = Laya.Pool.getItemByCreateFun('skinItem', box.appPrefab.create, box.appPrefab);
          (this.icon = e.getChildByName('icon')),
              e.size(box.appWidth, box.appHeight),
              this.addChild(e),
              (this.item = e),
              (e.x += 8);
      }
      setItemInfo(e) {
          if (null == e)
              return;
          this.icon.skin = 'ui/common/skin/skin/role_0' + e.id + '.png';
          let t = this.item.getChildByName('txt'), i = this.item.getChildByName('select');
          e.show
              ? ((t.visible = !1), e.select ? (i.visible = !0) : (i.visible = !1))
              : ((i.visible = !1), (t.visible = !0));
      }
  }
  box.appWidth = 180;
  box.appHeight = 185;

  class listSkin extends I {
      constructor() {
          super(),
              (this.selectIndex = 0),
              (this.list = null),
              (this.skinData = []),
              (this.tipArr = [
                  'Opening number +3',
                  'Resurrection time -1s',
                  'Speed +5%',
                  'Opening number +5, Speed +5%',
                  'Opening number +10',
                  'Opening number +10, Speed +5%',
                  'Resurrection time -2s, Speed +5%',
                  'Opening number +10, Speed +10%',
                  'Opening number +10, Resurrection time -2s',
                  'Opening number +15, Speed +10%',
                  'Opening number +30'
              ]),
              (this.btnIndex = 0),
              (this.btnState = 0),
              (this.coinArr = [1e4, 2e4, 3e4, 5e4, 8e4, 1e5, 12e4]),
              (this.model = null),
              (this.movev = 0);
      }
      onAwake() {
          super.onAwake();
      }
      initUI() {
          let e = this.getChild('topUI', this.owner), t = this.getChild('middleUI', this.owner), i = this.getChild('skinPanel', t);
          (this.coinNeed = this.getChild('coinNeed', t)),
              (this.coinNeed.visible = !1),
              (this.backBtn = this.getChild('backBtn', e)),
              (this.unLockBtn = this.getChild('unLockBtn', t)),
              (this.unLockBtn.skin = 'ui/common/skin/btn_are unlocked.png'),
              (this.getBtn = this.getChild('getBtn', t)),
              (this.tipTxt = this.getChild('tipTxt', t)),
              (this.coinValue = this.getChild('coinBg', e).getChildByName('value')),
              (this.coinValue.text = M.commonData.userCoin + ''),
              (this.light = this.getChild('light', t)),
              (this.list = this.getChild('listSkin', i)),
              (this.selectIndex = M.commonData.skinId),
              (this.btnIndex = this.selectIndex),
              this.selectIndex > 0
                  ? ((this.tipTxt.text = this.tipArr[this.selectIndex - 1]), (this.tipTxt.visible = !0))
                  : (this.tipTxt.visible = !1),
              this.initScene(),
              this.show3dScene(!0),
              Laya.timer.frameLoop(1, this, this.rotateFunc),
              Laya.loader.load('prefab/skinItem.json', Laya.Handler.create(this, this.initList), null, Laya.Loader.PREFAB);
      }
      initEvent() {
          M.utils.addClickEvent(this.backBtn, this, this.onBackClick),
              M.utils.addClickEvent(this.unLockBtn, this, this.onUnlockClick),
              M.utils.addClickEvent(this.getBtn, this, this.onGetBtnClick),
              M.glEvent.on('update_coin', this, this.updateScore);
      }
      updateScore() {
          this.coinValue.text = M.commonData.userCoin + '';
      }
      onBackClick() {
          this.openOtherPage('HOME');
      }
      openOtherPage(e) {
          M.storageMgr.setSkinId(this.selectIndex),
              (M.commonData.skinId = this.selectIndex),
              this.show3dScene(!1),
              M.gameMgr && M.gameMgr.playerLg.changeSkin(),
              Laya.Scene.close('views/listSkin.scene');
          platform.showInterstitialAd(true);
          M.glEvent.event('init_scene');
      }
      onUnlockClick() {
          1 == this.btnState ||
              (2 == this.btnState
                  ? M.commonData.userCoin < this.coinArr[this.btnIndex - 1]
                      ? M.uiMgr.showToast('Not enough coins!', 1500)
                      : ((M.commonData.userCoin -= this.coinArr[this.btnIndex - 1]),
                          this.updateScore(),
                          M.storageMgr.unlockSkin(this.btnIndex),
                          this.setBtnInfo())
                  : 3 == this.btnState
                      ? this.openOtherPage('LIMITREWARD')
                      : 4 == this.btnState && this.openOtherPage('DISK'));
      }
      onGetBtnClick() {
          platform.playVideo((isend) => {
              if (isend) {
                  M.commonData.userCoin += 5000;
                  this.updateScore();
                  M.uiMgr.showToast('Coins +5000', 1500);
              }
          });
      }
      showGoldAni() {
          let e = new Laya.Point(0, 0);
          (e.x = Laya.stage.width / 2), (e.y = Laya.stage.height / 2);
          let t = new Laya.Point(554, 156);
      }
      initList() {
          this.skinData = [];
          let e = M.storageMgr.getSkinArr();
          for (let t = 0; t < 12; ++t) {
              let i = {
                  id: t + 1,
                  show: e[t],
                  select: t == this.selectIndex
              };
              this.skinData.push(i);
          }
          (this.list.itemRender = box),
              (this.list.vScrollBarSkin = ''),
              (this.list.selectEnable = !0),
              (this.list.renderHandler = new Laya.Handler(this, this.onRender)),
              (this.list.mouseHandler = new Laya.Handler(this, this.onMouseHandler)),
              (this.list.array = this.skinData);
      }
      setBtnInfo() {
          this.skinData = [];
          let e = M.storageMgr.getSkinArr();
          this.btnIndex < 8
              ? e[this.btnIndex]
                  ? ((this.unLockBtn.skin = 'ui/common/skin/btn_are unlocked.png'),
                      (this.coinNeed.visible = !1),
                      (this.btnState = 1),
                      (this.unLockBtn.mouseEnabled = !1),
                      (this.selectIndex = this.btnIndex))
                  : ((this.unLockBtn.skin = 'ui/common/skin/btn_unlock skin.png'),
                      (this.coinNeed.visible = !0),
                      (this.coinNeed.getChildAt(0).text = this.coinArr[this.btnIndex - 1] + ''),
                      (this.btnState = 2),
                      (this.unLockBtn.mouseEnabled = !0))
              : this.btnIndex < 9
                  ? e[this.btnIndex]
                      ? ((this.unLockBtn.skin = 'ui/common/skin/btn_are unlocked.png'),
                          (this.coinNeed.visible = !1),
                          (this.btnState = 1),
                          (this.unLockBtn.mouseEnabled = !1),
                          (this.selectIndex = this.btnIndex))
                      : ((this.unLockBtn.skin = 'ui/common/skin/btn_reward.png'),
                          (this.coinNeed.visible = !1),
                          (this.btnState = 3),
                          (this.unLockBtn.mouseEnabled = !0))
                  : ((this.unLockBtn.skin = 'ui/common/skin/btn_lucky.png'),
                      (this.coinNeed.visible = !1),
                      (this.btnState = 4),
                      (this.unLockBtn.mouseEnabled = !0));
          for (let t = 0; t < 12; ++t) {
              let i = {
                  id: t + 1,
                  show: e[t],
                  select: t == this.selectIndex
              };
              this.skinData[t] = i;
          }
          (this.list.array = this.skinData),
              this.btnIndex > 0
                  ? ((this.tipTxt.text = this.tipArr[this.btnIndex - 1]), (this.tipTxt.visible = !0))
                  : (this.tipTxt.visible = !1);
      }
      initScene() {
          let e, t;
          if (M.commonData.showScene)
              (M.commonData.showScene.active = !0), (e = M.commonData.showScene), Laya.stage.addChild(e);
          else {
              let i = (e = Laya.stage.addChild(new Laya.Scene3D())).addChild(new Laya.DirectionLight());
              (i.color = new Laya.Vector3(1, 0.956, 0.839)),
                  (e.ambientSphericalHarmonicsIntensity = 1),
                  (e.ambientColor = new Laya.Vector3(0.8313726, 0.8313726, 0.8313726)),
                  (i.intensity = 0.6),
                  i.transform.rotate(new Laya.Vector3(10, -17, 0), !0, !1),
                  ((t = e.addChild(new Laya.Camera(0, 0.1, 100))).name = 'mainCamera'),
                  t.transform.translate(new Laya.Vector3(0, 2, 5)),
                  t.transform.rotate(new Laya.Vector3(-10, 0, 0), !0, !1),
                  (t.clearFlag = 2),
                  (M.commonData.showScene = e);
          }
      }
      rotateFunc() {
          this.model && ((this.movev += 0.04), (this.light.rotation += 0.5));
      }
      setRoleSkin(e) {
          this.model && (this.model.getChildByName('man')._render.material = M.gameMgr.roleMatArr[e + 1]);
      }
      show3dScene(e) {
          e
              ? ((this.model = M.gameMgr.showModel),
                  this.model &&
                      (this.setRoleSkin(this.btnIndex),
                          (M.commonData.showScene.active = !0),
                          M.commonData.showScene.addChild(this.model),
                          (this.model.active = !0),
                          (this.model.transform.localScale = new Laya.Vector3(0.8, 0.8, 0.8)),
                          (this.model.transform.position = new Laya.Vector3(0, 2.2, 0))))
              : (this.model && this.model.removeSelf(),
                  Laya.timer.clearAll(this),
                  (M.commonData.showScene.active = !1));
      }
      updateData() { }
      onRender(e, t) {
          e.setItemInfo(e.dataSource);
      }
      onMouseHandler(e, t) {
          'mouseup' == e.type && ((this.btnIndex = t), this.setBtnInfo(), this.show3dScene(!0));
      }
  }

  class LoadingView extends Laya.Script {
      constructor() {
          super();
          this.progressBar = null;
      }
      onEnable() {
          M.glEvent.on('load_pass_event', this, this.onProgress);
      }
      onDisable() {
      }
      onProgress(p) {
          console.log(p);
      }
  }

  class revivalView extends I {
      constructor() {
          super(), (this.timeCount = 0), (this.bVideo = !1), (this.bClose = !1);
      }
      onAwake() {
          super.onAwake();
      }
      initUI() {
          let e = this.getChild('middleUI', this.owner);
          (this.videoBtn = this.getChild('videoBtn', e)),
              (this.revivalBtn = this.getChild('revivalBtn', e)),
              (this.timeCount = 0),
              Laya.timer.loop(1e3, this, this.lateSet);
          platform.hideNativeAd(NativeType.small);
          platform.showNativeAd(NativeType.three);
      }
      lateSet() {
          if (this.bVideo)
              return;
          this.timeCount++, M.soundMgr.play(7), M.gameMgr.playVibrate(!0);
          let e = M.gameMgr.playerLg.showPlayerLg.revivalTime;
          this.timeCount >= e &&
              (M.gameMgr.playerLg.showPlayerLg.lateRevival(!1),
                  Laya.timer.clear(this, this.lateSet),
                  this.closeView()),
              (this.revivalBtn.getChildByName('font').value = '' + (Math.floor(e + 0.95) - this.timeCount));
      }
      initEvent() {
          M.utils.addClickEvent(this.videoBtn, this, this.onVideoClick),
              M.utils.addClickEvent(this.revivalBtn, this, this.onSkipBtnClick);
      }
      onVideoClick() {
          this.owner.scene.mouseEnabled = false;
          platform.playVideo((isend) => {
              if (isend) {
                  this.bVideo = !0;
                  M.gameMgr.playerLg.showPlayerLg.videoSetStop();
                  M.gameMgr.playerLg.showPlayerLg.lateRevival(!0);
                  this.closeView();
              }
              this.owner.scene.mouseEnabled = true;
          }, () => {
              this.owner.scene.mouseEnabled = true;
          });
      }
      onSkipBtnClick() {
          M.gameMgr.playerLg.showPlayerLg.lateRevival(!1), this.closeView();
      }
      closeView() {
          Laya.timer.clear(this, this.lateSet), Laya.Scene.close('views/revivalView.scene');
          platform.hideNativeAd(NativeType.three);
          platform.showNativeAd(NativeType.small);
      }
      onClosed() {
          Laya.timer.clearAll(this);
      }
      onUpdate() { }
  }

  class SuccessView extends I {
      constructor() {
          super(),
              (this.doubleReward = !1),
              (this.addTipArr = []),
              (this.addTipShow = []),
              (this.coinStart = null),
              (this.isCoinAni = !1),
              (this.endValue = 0),
              (this.coinCount = 0),
              (this.coinFlyValue = 0);
      }
      initData() { }
      initUI() {
          platform.report(ReportEvent.first_settlement);
          let e = this.getChild('topUI', this.owner), t = this.getChild('midddleUI', this.owner), i = this.getChild('bottomUI', this.owner);
          (this.nextBtn = this.getChild('nextBtn', i)),
              (this.videoBtn = this.getChild('videoBtn', i)),
              (this.videoBtn.visible = !0),
              (this.doubleReward = !1),
              (this.endWithe = this.getChild('endWithe', this.owner)),
              (this.endWithe.visible = !1),
              (this.addTipBox = this.getChild('addCoin', t)),
              (this.addTipShow.length = 20),
              (this.addTipArr.length = 20);
          for (let e = 0; e < 20; ++e) {
              this.addTipShow[e] = !1;
              let t = this.addTipBox.getChildAt(e);
              (t.visible = !1), t.addComponent(B).init(t, e), (this.addTipArr[e] = t);
          }
          (this.coinBg = this.getChild('coinBg', e)),
              (this.singleCoinValue = i.getChildByName('coin').getChildByName('value')),
              (this.singleCoinValue.text = Math.floor(M.gameData.gameCoin) + ''),
              (this.coinStart = i.getChildByName('coin')),
              (this.coinValue = this.coinBg.getChildByName('value')),
              (this.coinValue.text = M.commonData.userCoin + ''),
              M.commonData.newLevel++,
              M.storageMgr.setGameStausLevel(M.commonData.newLevel);
      }
      initEvent() {
          M.utils.addClickEvent(this.nextBtn, this, this.onBtnAcquire),
              M.utils.addClickEvent(this.videoBtn, this, this.onPlayVideoClick);
      }
      lateCoin() {
          (M.gameData.gameCoin = 0), M.gameMgr.gameReset(), this.endWhiteAni();
      }
      endWhiteAni() {
          (this.endValue = 0),
              (this.endWithe.alpha = 0),
              (this.endWithe.visible = !0),
              (Laya.Tween.to(this, {
                  endValue: 1
              }, 300, Laya.Ease.linearIn, new Laya.Handler(this, () => {
                  Laya.timer.once(700, this, () => {
                      Laya.Scene.close('views/success.scene');
                      platform.showInterstitialAd();
                      Laya.Scene.open('views/home.scene', !1);
                  });
              })).update = new Laya.Handler(this, () => {
                  this.endWithe.alpha = this.endValue;
              }));
      }
      loopAniSet() {
          (this.coinCount = 0),
              (this.isCoinAni = !0),
              this.doubleReward &&
                  ((M.gameData.gameCoin *= 3),
                      (this.singleCoinValue.text = Math.floor(M.gameData.gameCoin) + '')),
              (this.coinFlyValue = Math.floor(M.gameData.gameCoin / 20)),
              Laya.timer.loop(50, this, this.loopAni),
              Laya.timer.once(2200, this, this.lateCoin);
      }
      loopAni() {
          this.coinCount++,
              this.coinCount % 3 == 0 && (M.soundMgr.play(12), M.gameMgr.playVibrate(!0)),
              this.coinCount < 21
                  ? this.showAddUi(this.coinFlyValue)
                  : ((M.commonData.userCoin += Math.floor(M.gameData.gameCoin) - 20 * this.coinFlyValue),
                      M.storageMgr.setAwardGold(M.commonData.userCoin),
                      (this.coinValue.text = M.commonData.userCoin + ''),
                      Laya.timer.clear(this, this.loopAni));
      }
      showAddUi(e) {
          let t = this.addTipArr[this.coinCount - 1], i = this.getChild('bottomUI', this.owner), s = new Laya.Vector2(this.coinBg.x - 5, this.coinBg.y - Laya.stage.height / 2 - 18), a = new Laya.Vector2(this.coinStart.x + 83, this.coinStart.y + i.y - Laya.stage.height / 2 - 2);
          t.pos(a.x, a.y), t.getComponent(B).setMove(!0, a, s, e, this.upDateScore, this);
      }
      upDateScore(e) {
          e.coinValue.text = M.commonData.userCoin + '';
      }
      onBtnAcquire() {
          (this.owner.scene.mouseEnabled = !1), this.isCoinAni || this.loopAniSet();
      }
      onSkinShopClick() {
          this.isCoinAni;
      }
      onPlayVideoClick() {
          if (this.isCoinAni)
              return;
          platform.playVideo((isend) => {
              if (isend) {
                  this.doubleReward = true;
                  M.uiMgr.showToast('Triple coins!', 2e3);
                  this.loopAniSet();
              }
          });
      }
  }

  class GameConfig {
      constructor() { }
      static init() {
          var reg = Laya.ClassUtils.regClass;
          reg("script/stackIOViews/luckyRotate.ts", luckyRotate);
          reg("sdk/NativeAd.ts", NativeAd);
          reg("script/stackIOViews/FailView.ts", FailView);
          reg("script/stackIOViews/FreeSkin.ts", FreeSkin);
          reg("script/stackIOViews/GGame.ts", GGame);
          reg("script/stackIOViews/HomeView.ts", HomeView);
          reg("script/stackIOViews/limitReward.ts", limitReward);
          reg("script/stackIOViews/listSkin.ts", listSkin);
          reg("script/stackIOViews/LoadingView.ts", LoadingView);
          reg("script/stackIOViews/popups/BubbleText.ts", BubbleText);
          reg("script/stackIOViews/revivalView.ts", revivalView);
          reg("script/stackIOViews/SuccessView.ts", SuccessView);
      }
  }
  GameConfig.width = 750;
  GameConfig.height = 1134;
  GameConfig.scaleMode = "fixedwidth";
  GameConfig.screenMode = "none";
  GameConfig.alignV = "top";
  GameConfig.alignH = "left";
  GameConfig.startScene = "views/disk.scene";
  GameConfig.sceneRoot = "";
  GameConfig.debug = false;
  GameConfig.stat = false;
  GameConfig.physicsDebug = false;
  GameConfig.exportSceneToJson = true;
  GameConfig.init();

  var at = Laya.Shader3D;
  class ot extends Laya.Material {
      constructor() {
          super(), this.setShaderName('BlinnPhongFog');
      }
      static init() {
          Laya.ClassUtils.regClass('Laya.BlinnPhongFog', ot);
      }
      clone() {
          let e = new ot();
          return ((e._Color = this._Color),
              (e._Cull = this._Cull),
              (e._SpecularColor = this._SpecularColor),
              (e._RimColor = this._RimColor),
              (e._MainTex = this._MainTex),
              (e._NormalTex = this._NormalTex),
              (e._MaskTex = this._MaskTex),
              (e._EmissionTex = this._EmissionTex),
              (e._EmissionDirX = this._EmissionDirX),
              (e._EmissionDirY = this._EmissionDirY),
              (e._EmissionPower = this._EmissionPower),
              (e._EmissionColor = this._EmissionColor),
              (e._FogTex = this._FogTex),
              (e._FogDirX = this._FogDirX),
              (e._FogDirY = this._FogDirY),
              (e._FogMapScale = this._FogMapScale),
              (e._FogPower = this._FogPower),
              (e._FadeFogColor = this._FadeFogColor),
              (e._FadeHeightFogColor = this._FadeHeightFogColor),
              (e._FadeFogNear = this._FadeFogNear),
              (e._FadeFogFar = this._FadeFogFar),
              (e._HeightFogPower = this._HeightFogPower),
              (e._HeightFogStart = this._HeightFogStart),
              (e._HeightFogRange = this._HeightFogRange),
              (e._Contrast = this._Contrast),
              (e._Specular = this._Specular),
              (e._SpecSmooth = this._SpecSmooth),
              (e._RimPower = this._RimPower),
              e);
      }
      get _Cull() {
          return this._shaderValues.getInt(ot.CULL);
      }
      set _Cull(e) {
          let t = 0;
          (t = e < 1 ? 0 : e < 2 ? 1 : 2), this._shaderValues.setInt(ot.CULL, t);
      }
      get _Color() {
          return this._shaderValues.getVector(ot.DIFFUSECOLOR);
      }
      set _Color(e) {
          this._shaderValues.setVector(ot.DIFFUSECOLOR, e);
      }
      get _SpecularColor() {
          return this._shaderValues.getVector(ot.SPECULARCOLOR);
      }
      set _SpecularColor(e) {
          this._shaderValues.setVector(ot.SPECULARCOLOR, e);
      }
      get _RimColor() {
          return this._shaderValues.getVector(ot.RIMCOLOR);
      }
      set _RimColor(e) {
          this._shaderValues.setVector(ot.RIMCOLOR, e);
      }
      get _MainTex() {
          return this._shaderValues.getTexture(ot.DIFFUSETEXTURE);
      }
      set _MainTex(e) {
          e
              ? this._shaderValues.addDefine(ot.SHADERDEFINE_DIFFUSEMAP)
              : this._shaderValues.removeDefine(ot.SHADERDEFINE_DIFFUSEMAP),
              this._shaderValues.setTexture(ot.DIFFUSETEXTURE, e);
      }
      get _NormalTex() {
          return this._shaderValues.getTexture(ot.NORMALTEXTURE);
      }
      set _NormalTex(e) {
          e
              ? this._shaderValues.addDefine(ot.SHADERDEFINE_NORMALMAP)
              : this._shaderValues.removeDefine(ot.SHADERDEFINE_NORMALMAP),
              this._shaderValues.setTexture(ot.NORMALTEXTURE, e);
      }
      get _MaskTex() {
          return this._shaderValues.getTexture(ot.MASKTEXTURE);
      }
      set _MaskTex(e) {
          e
              ? this._shaderValues.addDefine(ot.SHADERDEFINE_MASKMAP)
              : this._shaderValues.removeDefine(ot.SHADERDEFINE_MASKMAP),
              this._shaderValues.setTexture(ot.MASKTEXTURE, e);
      }
      get _EmissionTex() {
          return this._shaderValues.getTexture(ot.EMISSIONTEXTURE);
      }
      set _EmissionTex(e) {
          e
              ? this._shaderValues.addDefine(ot.SHADERDEFINE_EMISSIONMAP)
              : this._shaderValues.removeDefine(ot.SHADERDEFINE_EMISSIONMAP),
              this._shaderValues.setTexture(ot.EMISSIONTEXTURE, e);
      }
      get _EmissionDirX() {
          return this._shaderValues.getNumber(ot.EMISSIONDIRECTIONX);
      }
      set _EmissionDirX(e) {
          this._shaderValues.setNumber(ot.EMISSIONDIRECTIONX, e);
      }
      get _EmissionDirY() {
          return this._shaderValues.getNumber(ot.EMISSIONDIRECTIONY);
      }
      set _EmissionDirY(e) {
          this._shaderValues.setNumber(ot.EMISSIONDIRECTIONY, e);
      }
      get _EmissionPower() {
          return this._shaderValues.getNumber(ot.EMISSIONPOWER);
      }
      set _EmissionPower(e) {
          this._shaderValues.setNumber(ot.EMISSIONPOWER, e);
      }
      get _EmissionColor() {
          return this._shaderValues.getVector(ot.EMISSIONCOLOR);
      }
      set _EmissionColor(e) {
          this._shaderValues.setVector(ot.EMISSIONCOLOR, e);
      }
      get _FogTex() {
          return this._shaderValues.getTexture(ot.FOGTEXURE);
      }
      set _FogTex(e) {
          e
              ? this._shaderValues.addDefine(ot.SHADERDEFINE_FOGMAP)
              : this._shaderValues.removeDefine(ot.SHADERDEFINE_FOGMAP),
              this._shaderValues.setTexture(ot.FOGTEXURE, e);
      }
      get _FogDirX() {
          return this._shaderValues.getNumber(ot.FOGDIRECTIONX);
      }
      set _FogDirX(e) {
          this._shaderValues.setNumber(ot.FOGDIRECTIONX, e);
      }
      get _FogDirY() {
          return this._shaderValues.getNumber(ot.FOGDIRECTIONY);
      }
      set _FogDirY(e) {
          this._shaderValues.setNumber(ot.FOGDIRECTIONY, e);
      }
      get _FogMapScale() {
          return this._shaderValues.getNumber(ot.FOGMAPSCALE);
      }
      set _FogMapScale(e) {
          this._shaderValues.setNumber(ot.FOGMAPSCALE, e);
      }
      get _FadeFogColor() {
          return this._shaderValues.getNumber(ot.FADEFOGCOLOR);
      }
      set _FadeFogColor(e) {
          this._shaderValues.setNumber(ot.FADEFOGCOLOR, e);
      }
      get _FadeHeightFogColor() {
          return this._shaderValues.getNumber(ot.FADEHEIGHTFOGCOLOR);
      }
      set _FadeHeightFogColor(e) {
          this._shaderValues.setNumber(ot.FADEHEIGHTFOGCOLOR, e);
      }
      get _FadeFogNear() {
          return this._shaderValues.getNumber(ot.FADEFOGNEAR);
      }
      set _FadeFogNear(e) {
          this._shaderValues.setNumber(ot.FADEFOGNEAR, e);
      }
      get _FadeFogFar() {
          return this._shaderValues.getNumber(ot.FADEFOGFAR);
      }
      set _FadeFogFar(e) {
          this._shaderValues.setNumber(ot.FADEFOGFAR, e);
      }
      get _FogPower() {
          return this._shaderValues.getNumber(ot.FOGPOWER);
      }
      set _FogPower(e) {
          this._shaderValues.setNumber(ot.FOGPOWER, e);
      }
      get _HeightFogPower() {
          return this._shaderValues.getNumber(ot.HEIGHTFOGPOWER);
      }
      set _HeightFogPower(e) {
          this._shaderValues.setNumber(ot.HEIGHTFOGPOWER, e);
      }
      get _HeightFogStart() {
          return this._shaderValues.getNumber(ot.HEIGHTFOGSTART);
      }
      set _HeightFogStart(e) {
          this._shaderValues.setNumber(ot.HEIGHTFOGSTART, e);
      }
      get _HeightFogRange() {
          return this._shaderValues.getNumber(ot.HEIGHTFOGRANGE);
      }
      set _HeightFogRange(e) {
          this._shaderValues.setNumber(ot.HEIGHTFOGRANGE, e);
      }
      get _Contrast() {
          return this._shaderValues.getNumber(ot.CONTRAST);
      }
      set _Contrast(e) {
          this._shaderValues.setNumber(ot.CONTRAST, e);
      }
      get _Specular() {
          return this._shaderValues.getNumber(ot.SPECULAR);
      }
      set _Specular(e) {
          this._shaderValues.setNumber(ot.SPECULAR, e);
      }
      get _SpecSmooth() {
          return this._shaderValues.getNumber(ot.SPECUALRSMOOTH);
      }
      set _SpecSmooth(e) {
          this._shaderValues.setNumber(ot.SPECUALRSMOOTH, e);
      }
      get _RimPower() {
          return this._shaderValues.getNumber(ot.RIMPOWER);
      }
      set _RimPower(e) {
          this._shaderValues.setNumber(ot.RIMPOWER, e);
      }
  }
  ot.DIFFUSETEXTURE = Laya.Shader3D.propertyNameToID('u_DiffuseTexture');
  ot.DIFFUSECOLOR = Laya.Shader3D.propertyNameToID('u_DiffuseColor');
  ot.NORMALTEXTURE = Laya.Shader3D.propertyNameToID('u_NormalTexture');
  ot.SPECULARCOLOR = Laya.Shader3D.propertyNameToID('u_SpecularColor');
  ot.RIMCOLOR = Laya.Shader3D.propertyNameToID('u_RimColor');
  ot.CONTRAST = Laya.Shader3D.propertyNameToID('u_Contrast');
  ot.SPECULAR = Laya.Shader3D.propertyNameToID('u_Specular');
  ot.SPECUALRSMOOTH = Laya.Shader3D.propertyNameToID('u_SpecularSmooth');
  ot.RIMPOWER = Laya.Shader3D.propertyNameToID('u_RimPower');
  ot.MASKTEXTURE = Laya.Shader3D.propertyNameToID('u_MaskTexture');
  ot.EMISSIONTEXTURE = Laya.Shader3D.propertyNameToID('u_EmissionTexture');
  ot.EMISSIONDIRECTIONX = Laya.Shader3D.propertyNameToID('u_EmissionDirectionX');
  ot.EMISSIONDIRECTIONY = Laya.Shader3D.propertyNameToID('u_EmissionDirectionY');
  ot.EMISSIONPOWER = Laya.Shader3D.propertyNameToID('u_EmissionPower');
  ot.EMISSIONCOLOR = Laya.Shader3D.propertyNameToID('u_EmissionColor');
  ot.FOGTEXURE = Laya.Shader3D.propertyNameToID('u_FogTexture');
  ot.FOGDIRECTIONX = Laya.Shader3D.propertyNameToID('u_FogDirectionX');
  ot.FOGDIRECTIONY = Laya.Shader3D.propertyNameToID('u_FogDirectionY');
  ot.FOGMAPSCALE = Laya.Shader3D.propertyNameToID('u_FogMapScale');
  ot.FOGPOWER = Laya.Shader3D.propertyNameToID('u_FogPower');
  ot.FADEFOGCOLOR = Laya.Shader3D.propertyNameToID('u_FadeFogColor');
  ot.FADEHEIGHTFOGCOLOR = Laya.Shader3D.propertyNameToID('u_FadeHeightFogColor');
  ot.FADEFOGNEAR = Laya.Shader3D.propertyNameToID('u_FadeFogNear');
  ot.FADEFOGFAR = Laya.Shader3D.propertyNameToID('u_FadeFogFar');
  ot.HEIGHTFOGPOWER = Laya.Shader3D.propertyNameToID('u_HeightFogPower');
  ot.HEIGHTFOGSTART = Laya.Shader3D.propertyNameToID('u_HeightFogStart');
  ot.HEIGHTFOGRANGE = Laya.Shader3D.propertyNameToID('u_HeightFogRange');
  ot.CULL = at.propertyNameToID('s_Cull');
  ot.SHADERDEFINE_DIFFUSEMAP = Laya.Shader3D.getDefineByName('DIFFUSEMAP');
  ot.SHADERDEFINE_NORMALMAP = Laya.Shader3D.getDefineByName('NORMALMAP');
  ot.SHADERDEFINE_MASKMAP = Laya.Shader3D.getDefineByName('MASKMAP');
  ot.SHADERDEFINE_EMISSIONMAP = Laya.Shader3D.getDefineByName('EMISSIONMAP');
  ot.SHADERDEFINE_FOGMAP = Laya.Shader3D.getDefineByName('FOGMAP');

  var et = Laya.Shader3D, tt = Laya.SubShader, it = Laya.VertexMesh;
  class st {
      static init() {
          var e = {
              a_Position: it.MESH_POSITION0,
              a_Color: it.MESH_COLOR0,
              a_Normal: it.MESH_NORMAL0,
              a_Texcoord0: it.MESH_TEXTURECOORDINATE0,
              a_Texcoord1: it.MESH_TEXTURECOORDINATE1,
              a_BoneWeights: it.MESH_BLENDWEIGHT0,
              a_BoneIndices: it.MESH_BLENDINDICES0,
              a_Tangent0: it.MESH_TANGENT0,
              a_WorldMat: it.MESH_WORLDMATRIX_ROW0
          }, t = {
              u_Bones: et.PERIOD_CUSTOM,
              u_WorldMat: et.PERIOD_SPRITE,
              u_MvpMatrix: et.PERIOD_SPRITE,
              u_Projection: et.PERIOD_CAMERA,
              u_LightmapScaleOffset: et.PERIOD_SPRITE,
              u_LightMap: et.PERIOD_SPRITE,
              u_LightMapDirection: et.PERIOD_SPRITE,
              u_CameraPos: et.PERIOD_CAMERA,
              u_Viewport: et.PERIOD_CAMERA,
              u_ProjectionParams: et.PERIOD_CAMERA,
              u_View: et.PERIOD_CAMERA,
              u_ViewProjection: et.PERIOD_CAMERA,
              u_ReflectTexture: et.PERIOD_SCENE,
              u_ReflectIntensity: et.PERIOD_SCENE,
              u_DirationLightCount: et.PERIOD_SCENE,
              u_LightBuffer: et.PERIOD_SCENE,
              u_LightClusterBuffer: et.PERIOD_SCENE,
              u_AmbientColor: et.PERIOD_SCENE,
              u_ShadowBias: et.PERIOD_SCENE,
              u_ShadowLightDirection: et.PERIOD_SCENE,
              u_ShadowMap: et.PERIOD_SCENE,
              u_ShadowParams: et.PERIOD_SCENE,
              u_ShadowSplitSpheres: et.PERIOD_SCENE,
              u_ShadowMatrices: et.PERIOD_SCENE,
              u_ShadowMapSize: et.PERIOD_SCENE,
              u_Time: et.PERIOD_SCENE,
              u_AmbientSHAr: et.PERIOD_SCENE,
              u_AmbientSHAg: et.PERIOD_SCENE,
              u_AmbientSHAb: et.PERIOD_SCENE,
              u_AmbientSHBr: et.PERIOD_SCENE,
              u_AmbientSHBg: et.PERIOD_SCENE,
              u_AmbientSHBb: et.PERIOD_SCENE,
              u_AmbientSHC: et.PERIOD_SCENE,
              u_FogColor: et.PERIOD_SCENE,
              u_FogRange: et.PERIOD_SCENE,
              u_FogStart: et.PERIOD_SCENE,
              'u_SunLight.color': et.PERIOD_SCENE,
              'u_SunLight.direction': et.PERIOD_SCENE,
              'u_PointLight.position': et.PERIOD_SCENE,
              'u_PointLight.range': et.PERIOD_SCENE,
              'u_PointLight.color': et.PERIOD_SCENE,
              'u_SpotLight.position': et.PERIOD_SCENE,
              'u_SpotLight.direction': et.PERIOD_SCENE,
              'u_SpotLight.range': et.PERIOD_SCENE,
              'u_SpotLight.spot': et.PERIOD_SCENE,
              'u_SpotLight.color': et.PERIOD_SCENE,
              u_DiffuseTexture: et.PERIOD_MATERIAL,
              u_DiffuseColor: et.PERIOD_MATERIAL,
              u_NormalTexture: et.PERIOD_MATERIAL,
              u_SpecularColor: et.PERIOD_MATERIAL,
              u_RimColor: et.PERIOD_MATERIAL,
              u_Contrast: et.PERIOD_MATERIAL,
              u_Specular: et.PERIOD_MATERIAL,
              u_SpecularSmooth: et.PERIOD_MATERIAL,
              u_RimPower: et.PERIOD_MATERIAL,
              u_MaskTexture: et.PERIOD_MATERIAL,
              u_EmissionTexture: et.PERIOD_MATERIAL,
              u_EmissionDirectionX: et.PERIOD_MATERIAL,
              u_EmissionDirectionY: et.PERIOD_MATERIAL,
              u_EmissionPower: et.PERIOD_MATERIAL,
              u_EmissionColor: et.PERIOD_MATERIAL,
              u_FogTexture: et.PERIOD_MATERIAL,
              u_FogDirectionX: et.PERIOD_MATERIAL,
              u_FogDirectionY: et.PERIOD_MATERIAL,
              u_FogMapScale: et.PERIOD_MATERIAL,
              u_FogPower: et.PERIOD_MATERIAL,
              u_FadeFogColor: et.PERIOD_MATERIAL,
              u_FadeHeightFogColor: et.PERIOD_MATERIAL,
              u_FadeFogNear: et.PERIOD_MATERIAL,
              u_FadeFogFar: et.PERIOD_MATERIAL,
              u_HeightFogPower: et.PERIOD_MATERIAL,
              u_HeightFogStart: et.PERIOD_MATERIAL,
              u_HeightFogRange: et.PERIOD_MATERIAL
          }, i = {
              s_Cull: et.RENDER_STATE_CULL,
              s_Blend: et.RENDER_STATE_BLEND,
              s_BlendSrc: et.RENDER_STATE_BLEND_SRC,
              s_BlendDst: et.RENDER_STATE_BLEND_DST,
              s_DepthTest: et.RENDER_STATE_DEPTH_TEST,
              s_DepthWrite: et.RENDER_STATE_DEPTH_WRITE
          }, s = et.add('BlinnPhongFog', null, null, !0), a = new tt(e, t);
          s.addSubShader(a);
          a.addShaderPass('#include "Lighting.glsl";\n    #include "Shadow.glsl";\n    \n    attribute vec4 a_Position;\n    \n    #ifdef GPU_INSTANCE\n        //attribute mat4 a_MvpMatrix;\n        uniform mat4 u_ViewProjection;\n    #else\n        uniform mat4 u_MvpMatrix;\n    #endif\n    \n    #if defined(DIFFUSEMAP) || defined(MASKMAP) || defined(EMISSIONMAP) || defined(FOGMAP) ||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))||(defined(LIGHTMAP)&&defined(UV))\n        attribute vec2 a_Texcoord0;\n        varying vec2 v_Texcoord0;\n    #endif\n    \n    #ifdef COLOR\n        attribute vec4 a_Color;\n        varying vec4 v_Color;\n    #endif\n    \n    #ifdef BONE\n        const int c_MaxBoneCount = 24;\n        attribute vec4 a_BoneIndices;\n        attribute vec4 a_BoneWeights;\n        uniform mat4 u_Bones[c_MaxBoneCount];\n    #endif\n    \n    attribute vec3 a_Normal;\n    varying vec3 v_Normal; \n    \n    #if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)\n        uniform vec3 u_CameraPos;\n        varying vec3 v_ViewDir; \n    #endif\n    \n    #if defined(NORMALMAP)\n        attribute vec4 a_Tangent0;\n        varying vec3 v_Tangent;\n        varying vec3 v_Binormal;\n    #endif\n    \n    #ifdef GPU_INSTANCE\n        attribute mat4 a_WorldMat;\n    #else\n        uniform mat4 u_WorldMat;\n    #endif\n    \n    varying vec3 v_PositionWorld;\n    \n    #ifdef TILINGOFFSET\n        uniform vec4 u_TilingOffset;\n    #endif\n    \n    #ifdef SIMPLEBONE\n        #ifdef GPU_INSTANCE\n            attribute vec4 a_SimpleTextureParams;\n        #else\n            uniform vec4 u_SimpleAnimatorParams;\n        #endif\n        uniform sampler2D u_SimpleAnimatorTexture;\n    \n        uniform float u_SimpleAnimatorTextureSize; \n    #endif\n    \n    \n    #ifdef SIMPLEBONE\n    mat4 loadMatFromTexture(float FramePos,int boneIndices,float offset)\n    {\n        vec2 uv;\n        float PixelPos = FramePos+float(boneIndices)*4.0;\n        float halfOffset = offset * 0.5;\n        float uvoffset = PixelPos/u_SimpleAnimatorTextureSize;\n        uv.y = floor(uvoffset)*offset+halfOffset;\n        uv.x = mod(float(PixelPos),u_SimpleAnimatorTextureSize)*offset+halfOffset;\n        vec4 mat0row = texture2D(u_SimpleAnimatorTexture,uv);\n        uv.x+=offset;\n        vec4 mat1row = texture2D(u_SimpleAnimatorTexture,uv);\n        uv.x+=offset;\n        vec4 mat2row = texture2D(u_SimpleAnimatorTexture,uv);\n        uv.x+=offset;\n        vec4 mat3row = texture2D(u_SimpleAnimatorTexture,uv);\n        mat4 m =mat4(mat0row.x,mat0row.y,mat0row.z,mat0row.w,\n                  mat1row.x,mat1row.y,mat1row.z,mat1row.w,\n                  mat2row.x,mat2row.y,mat2row.z,mat2row.w,\n                  mat3row.x,mat3row.y,mat3row.z,mat3row.w);\n        return m;\n    }\n    #endif\n    \n    void main()\n    {\n        vec4 position;\n        #ifdef BONE\n            mat4 skinTransform;\n             #ifdef SIMPLEBONE\n                float currentPixelPos;\n                #ifdef GPU_INSTANCE\n                    currentPixelPos = a_SimpleTextureParams.x+a_SimpleTextureParams.y;\n                #else\n                    currentPixelPos = u_SimpleAnimatorParams.x+u_SimpleAnimatorParams.y;\n                #endif\n                float offset = 1.0/u_SimpleAnimatorTextureSize;\n                skinTransform =  loadMatFromTexture(currentPixelPos,int(a_BoneIndices.x),offset) * a_BoneWeights.x;\n                skinTransform += loadMatFromTexture(currentPixelPos,int(a_BoneIndices.y),offset) * a_BoneWeights.y;\n                skinTransform += loadMatFromTexture(currentPixelPos,int(a_BoneIndices.z),offset) * a_BoneWeights.z;\n                skinTransform += loadMatFromTexture(currentPixelPos,int(a_BoneIndices.w),offset) * a_BoneWeights.w;\n            #else\n                skinTransform =  u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;\n                skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;\n                skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;\n                skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;\n            #endif\n            position=skinTransform*a_Position;\n         #else\n            position=a_Position;\n        #endif\n    \n        #ifdef GPU_INSTANCE\n            gl_Position =u_ViewProjection * a_WorldMat * position;\n            //gl_Position = a_MvpMatrix * position;\n        #else\n            gl_Position = u_MvpMatrix * position;\n        #endif\n        \n        mat4 worldMat;\n        #ifdef GPU_INSTANCE\n            worldMat = a_WorldMat;\n        #else\n            worldMat = u_WorldMat;\n        #endif\n    \n        mat3 worldInvMat;\n        #ifdef BONE\n            worldInvMat=INVERSE_MAT(mat3(worldMat*skinTransform));\n        #else\n            worldInvMat=INVERSE_MAT(mat3(worldMat));\n        #endif  \n        v_Normal=normalize(a_Normal*worldInvMat);\n        #if defined(NORMALMAP)\n            v_Tangent=normalize(a_Tangent0.xyz*worldInvMat);\n            v_Binormal=cross(v_Normal,v_Tangent)*a_Tangent0.w;\n        #endif\n    \n        vec3 positionWS=(worldMat*position).xyz;\n        #if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)\n            v_ViewDir = u_CameraPos-positionWS;\n        #endif\n        v_PositionWorld = positionWS;\n    \n        #if defined(DIFFUSEMAP) || defined(MASKMAP) || defined(EMISSIONMAP) || defined(FOGMAP) ||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))\n            #ifdef TILINGOFFSET\n                v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);\n            #else\n                v_Texcoord0=a_Texcoord0;\n            #endif\n        #endif\n    \n        #if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)\n            v_Color=a_Color;\n        #endif\n    \n        gl_Position=remapGLPositionZ(gl_Position);\n    }', '#if defined(GL_FRAGMENT_PRECISION_HIGH)\n        precision highp float;\n        precision highp int;\n    #else\n        precision mediump float;\n        precision mediump int;\n    #endif\n    \n    #include "Lighting.glsl";\n    #include "Shadow.glsl"\n    \n    uniform vec4 u_DiffuseColor;\n    uniform vec4 u_SpecularColor;\n    uniform vec4 u_RimColor;\n    uniform float u_Contrast;\n    uniform float u_Specular;\n    uniform float u_SpecularSmooth;\n    uniform float u_RimPower;\n    \n    #if defined(EMISSIONMAP) || defined(FOGMAP)\n        uniform float u_Time;\n    #endif\n    \n    #if defined(COLOR)\n        varying vec4 v_Color;\n    #endif\n    \n    #ifdef DIFFUSEMAP\n        uniform sampler2D u_DiffuseTexture;\n    #endif\n    \n    #ifdef MASKMAP\n        uniform sampler2D u_MaskTexture;\n    #endif\n    \n    #ifdef EMISSIONMAP\n        uniform sampler2D u_EmissionTexture;\n        uniform float u_EmissionDirectionX;\n        uniform float u_EmissionDirectionY;\n        uniform float u_EmissionPower;\n        uniform vec4 u_EmissionColor;\n    #endif\n    \n    #if defined(DIFFUSEMAP) || defined(EMISSIONMAP) || defined(FOGMAP) ||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(NORMALMAP)))\n        varying vec2 v_Texcoord0;\n    #endif\n    \n    varying vec3 v_Normal;\n    #if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)\n        varying vec3 v_ViewDir; \n    \n        uniform vec3 u_MaterialSpecular;\n        uniform float u_Shininess;\n    \n        #ifdef LEGACYSINGLELIGHTING\n            #ifdef DIRECTIONLIGHT\n                uniform DirectionLight u_DirectionLight;\n            #endif\n            #ifdef POINTLIGHT\n                uniform PointLight u_PointLight;\n            #endif\n            #ifdef SPOTLIGHT\n                uniform SpotLight u_SpotLight;\n            #endif\n        #else\n            uniform mat4 u_View;\n            uniform vec4 u_ProjectionParams;\n            uniform vec4 u_Viewport;\n            uniform int u_DirationLightCount;\n            uniform DirectionLight u_SunLight;\n            uniform sampler2D u_LightBuffer;\n            uniform sampler2D u_LightClusterBuffer;\n        #endif\n    #endif\n    \n    #ifdef NORMALMAP \n        uniform sampler2D u_NormalTexture;\n        varying vec3 v_Tangent;\n        varying vec3 v_Binormal;\n    #endif\n    \n    #ifdef FOGMAP\n        uniform sampler2D u_FogTexture;\n        uniform float u_FogDirectionX;\n        uniform float u_FogDirectionY;\n        uniform float u_FogMapScale;\n        uniform float u_FogPower;\n        uniform vec4 u_FogColor;\n        uniform float u_FogStart;\n        uniform float u_FogRange;\n        uniform vec4 u_FadeFogColor;\n        uniform vec4 u_FadeHeightFogColor;\n        uniform float u_FadeFogNear;\n        uniform float u_FadeFogFar;\n        uniform float u_HeightFogPower;\n        uniform float u_HeightFogStart;\n        uniform float u_HeightFogRange;\n    #endif\n    \n    \n    varying vec3 v_PositionWorld;\n    #include "GlobalIllumination.glsl";//"GlobalIllumination.glsl use uniform should at front of this\n    \n    void main() {\n        vec4 baseColor = u_DiffuseColor;\n        #ifdef DIFFUSEMAP\n            vec4 difTexColor=texture2D(u_DiffuseTexture, v_Texcoord0);\n            baseColor=baseColor*difTexColor;\n        #endif\n    \n        vec3 normal;//light and SH maybe use normal\n        #if defined(NORMALMAP)\n            vec3 normalMapSample = texture2D(u_NormalTexture, v_Texcoord0).rgb;\n            normal = normalize(NormalSampleToWorldSpace(normalMapSample, v_Normal, v_Tangent,v_Binormal));\n        #else\n            normal = normalize(v_Normal);\n        #endif\n    \n        LayaGIInput giInput;\n        vec3 globalDiffuse=layaGIBase(giInput,1.0,normal);\n    \n        vec3 lightDir;\n        vec3 lightColor;\n        #if defined(DIRECTIONLIGHT)\n            lightDir = u_SunLight.direction;\n            lightColor = u_SunLight.color;\n        #else\n            lightDir = normalize(vec3(1.0, 1.0, 1.0));\n            lightColor = vec3(1.0, 1.0, 1.0);\n        #endif\n        lightDir = -lightDir;\n    \n        vec3 viewDir;\n        #if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)\n            viewDir = normalize(v_ViewDir);\n        #else\n            viewDir = normalize(vec3(1.0, 1.0, 1.0));\n        #endif\n    \n        vec3 halfDir = normalize(lightDir + viewDir);\n    \n        float ndl = max(0.001, dot(normal, lightDir));\n        float ndh = max(0.001, dot(normal, halfDir));\n        float ndv = max(0.001, dot(normal, viewDir));\n    \n        float diff = ndl * u_Contrast + (1.0 - u_Contrast);\n        float spec = pow(ndh, u_Specular * 128.0);\n        spec = smoothstep(0.5 - u_SpecularSmooth * 0.5, 0.5 + u_SpecularSmooth * 0.5, spec);\n    \n        vec4 maskCol = vec4(1.0, 1.0, 1.0, 1.0);\n        #ifdef MASKMAP\n            maskCol = texture2D(u_MaskTexture, v_Texcoord0);\n        #endif\n    \n        vec3 specular =  u_SpecularColor.rgb * spec * maskCol.r;\n    \n        float rim = (1.0 - ndv) * ndl;\n        vec3 rimColor = u_RimColor.rgb * u_RimPower * rim;\n    \n        vec3 emission = vec3(0.0, 0.0, 0.0);\n        #ifdef EMISSIONMAP\n            vec4 emissionCol = texture2D(u_EmissionTexture, v_Texcoord0);\n            #ifdef MASKMAP\n                vec4 emissionOffsetCol = texture2D(u_MaskTexture, v_Texcoord0 + vec2(u_EmissionDirectionX, u_EmissionDirectionY) * u_Time * 0.05);\n                emission = emissionCol.rgb * u_EmissionPower * emissionOffsetCol.g;\n                emission = mix(emission, emission * u_EmissionColor.rgb,  maskCol.b);\n            #else\n                emission = emissionCol.rgb * u_EmissionColor.rgb * u_EmissionPower;\n            #endif\n        #endif\n    \n        vec3 finalCol = (baseColor.rgb * lightColor + rimColor) * diff + specular + emission;\n        finalCol = finalCol + globalDiffuse * baseColor.rgb * lightColor;\n        // #if defined(COLOR)\n        // \tfinalCol = finalCol * v_Color.rgb;\n        // #endif\n    \n        #ifdef FOGMAP\n            float fogCoord = 1.0 - (1.0/gl_FragCoord.w-u_FogStart)/u_FogRange;\n    \n            vec2 worldUV = v_PositionWorld.xz / u_FogMapScale;\n            vec4 fogHeightColor = texture2D(u_FogTexture, worldUV + vec2(-u_FogDirectionX, u_FogDirectionY) * u_Time * 0.05);\n    \n            float fogDis = max(u_HeightFogRange, 0.01) * fogHeightColor.r;\n            float hFogLerp = (v_PositionWorld.y - u_HeightFogStart) / fogDis;\n            hFogLerp = mix(fogHeightColor.g * (1.0 - u_HeightFogPower), 1.0, clamp(hFogLerp, 0.0, 1.0));\n    \n            float fadeFogDis = max(u_FadeFogFar - u_FadeFogNear, 0.01);\n            float fadeFogLerp = clamp((1.0/gl_FragCoord.w - u_FadeFogNear) / fadeFogDis, 0.0, 1.0);\n    \n            vec4 fogColor = mix(u_FogColor, u_FadeHeightFogColor, clamp(fogCoord, 0.0, 1.0));\n            fogCoord = hFogLerp * (1.0 - fadeFogLerp) + fogCoord * fadeFogLerp;\n            fogColor = mix(fogColor, u_FadeFogColor, clamp(fogCoord, 0.0, 1.0));\n    \n            finalCol = mix(mix(finalCol,  fogColor.rgb, u_FogPower), finalCol, clamp(fogCoord, 0.0, 1.0));\n        #endif\n    \n        gl_FragColor = vec4(finalCol, 1.0);\n    }', i, 'Forward');
      }
  }

  class Ze extends Laya.Script {
      constructor() {
          super(), this.init();
      }
      init() {
          this.initLoaclalData();
          M.configMgr.init(M.glEvent);
          M.soundMgr.init();
          platform.report(ReportEvent.first_load);
          M.resourceMgr.init(M.glEvent, () => {
              Laya.Scene.close('views/loading.scene');
              platform.report(ReportEvent.first_load_complete);
              Laya.Scene.open('views/home.scene', false);
          });
      }
      onBlur() {
          console.log('失去焦点'),
              (Laya.timer.scale = 0),
              Laya.stage.once(Laya.Event.MOUSE_DOWN, this, () => {
                  console.log('点击获得焦点'), window.focus(), (Laya.timer.scale = 1);
              });
      }
      onFocus() {
          console.log('获得焦点');
      }
      initLoaclalData() {
          let e = M.storageMgr.gameStatus;
          (M.commonData.userCoin = e.awardGold),
              (M.commonData.skinId = e.skinId),
              (M.commonData.newLevel = e.level),
              (M.commonData.nameArr = M.commonData.nameStr.split(','));
      }
      workflowNext() {
      }
      workflowChildNext() {
      }
  }

  class Main {
      constructor() {
          if (window['Laya3D'])
              Laya3D.init(GameConfig.width, GameConfig.height, null, Laya.Handler.create(this, this.initMain));
          else {
              Laya.init(GameConfig.width, GameConfig.height, Laya['WebGL']);
              this.initMain();
          }
      }
      initMain() {
          Laya['Physics'] && Laya['Physics'].enable();
          Laya['DebugPanel'] && Laya['DebugPanel'].enable();
          Laya.stage.scaleMode = GameConfig.scaleMode;
          Laya.stage.screenMode = GameConfig.screenMode;
          Laya.stage.alignV = GameConfig.alignV;
          Laya.stage.alignH = GameConfig.alignH;
          Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
          if (GameConfig.debug || Laya.Utils.getQueryString('debug') == 'true')
              Laya.enableDebugPanel();
          if (GameConfig.physicsDebug && Laya['PhysicsDebugDraw'])
              Laya['PhysicsDebugDraw'].enable();
          if (GameConfig.stat)
              Laya.Stat.show();
          Laya.alertGlobalError(false);
          Laya.ResourceVersion.enable('version.json', Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
      }
      onVersionLoaded() {
          Laya.AtlasInfoManager.enable('fileconfig.json', Laya.Handler.create(this, this.onConfigLoaded));
      }
      onConfigLoaded() {
          Laya.Scene.open('views/loading.scene', false);
          M.init();
          st.init();
          ot.init();
          Laya.stage.addComponent(Ze);
          platform.start();
      }
  }
  new Main();

}());
