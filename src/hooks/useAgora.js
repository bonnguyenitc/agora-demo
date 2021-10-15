import { useState, useEffect, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { MdFormatListBulleted } from "react-icons/md";
import { TYPE_USER } from "../utils/constants";

export const ACTIONS_REMOTE = {
  OFF_VIDEO: "OFF_VIDEO",
  OFF_AUDIO: "OFF_AUDIO",
  ON_VIDEO: "ON_VIDEO",
  ON_AUDIO: "ON_AUDIO",
  OFF_VIDEO_SS: "OFF_VIDEO_SS",
  OFF_AUDIO_SS: "OFF_AUDIO_SS",
  ON_VIDEO_SS: "ON_VIDEO_SS",
  ON_AUDIO_SS: "ON_AUDIO_SS",
  KET_THUC_HON_LE: "KET_THUC_HON_LE",
  ACCESS_JOIN_MC: "ACCESS_JOIN_MC",
  REMOVE_JOIN_MC: "REMOVE_JOIN_MC",
};

export default function useAgora(client, clientRtm) {
  const [localVideoTrack, setLocalVideoTrack] = useState(undefined);
  const [localAudioTrack, setLocalAudioTrack] = useState(undefined);

  const [mics, setMics] = useState([]);
  const [cams, setCams] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  const [holdAction, setAction] = useState(null);

  const channelRtm = useRef(null);

  const [currentCam, setCurrentCam] = useState(null);
  const [currentMic, setCurrentMic] = useState(null);

  const [joinState, setJoinState] = useState(false);

  const [videoOn, setVideoOn] = useState(false);
  const [audioOn, setAudioOn] = useState(false);

  const [remoteUsers, setRemoteUsers] = useState({});

  const [remoteUsersStatus, setRemoteUsersStatus] = useState([]);

  const [role, setRole] = useState("");

  const [endHonLe, setEndHonLe] = useState(false);

  useEffect(() => {
    handleAction(holdAction?.action);
  }, [holdAction]);

  async function handleAction(action) {
    switch (action) {
      case ACTIONS_REMOTE.OFF_AUDIO:
        offPublishAudio();
        break;
      case ACTIONS_REMOTE.OFF_VIDEO:
        offPublishVideo();
        break;
      case ACTIONS_REMOTE.ON_AUDIO:
        onPublishAudio();
        break;
      case ACTIONS_REMOTE.ON_VIDEO:
        onPublishVideo();
        break;
      case ACTIONS_REMOTE.ON_VIDEO_SS:
        handleActionSuccess(action);
        break;
      case ACTIONS_REMOTE.OFF_VIDEO_SS:
        handleActionSuccess(action);
        break;
      case ACTIONS_REMOTE.ON_AUDIO_SS:
        handleActionSuccess(action);
        break;
      case ACTIONS_REMOTE.OFF_AUDIO_SS:
        handleActionSuccess(action);
        break;
      case ACTIONS_REMOTE.KET_THUC_HON_LE:
        if (currentUser?.type === TYPE_USER?.NORMAL) {
          setEndHonLe(true);
          leave();
        }
        break;
      default:
        break;
    }
  }

  function handleActionSuccess(action) {
    switch (action) {
      case ACTIONS_REMOTE.ON_VIDEO_SS:
        setRemoteUsers((remoteUsers) => {
          return {
            ...remoteUsers,
            [holdAction?.from]: {
              ...remoteUsers?.[holdAction?.from],
              onCamRemoterLocal: true,
            },
          };
        });
        break;
      case ACTIONS_REMOTE.OFF_VIDEO_SS:
        setRemoteUsers((remoteUsers) => {
          return {
            ...remoteUsers,
            [holdAction?.from]: {
              ...remoteUsers?.[holdAction?.from],
              onCamRemoterLocal: false,
            },
          };
        });
        break;
      case ACTIONS_REMOTE.ON_AUDIO_SS:
        setRemoteUsers((remoteUsers) => {
          return {
            ...remoteUsers,
            [holdAction?.from]: {
              ...remoteUsers?.[holdAction?.from],
              onMicRemoterLocal: true,
            },
          };
        });
        break;
      case ACTIONS_REMOTE.OFF_AUDIO_SS:
        setRemoteUsers((remoteUsers) => {
          return {
            ...remoteUsers,
            [holdAction?.from]: {
              ...remoteUsers?.[holdAction?.from],
              onMicRemoterLocal: false,
            },
          };
        });
        break;
    }
  }

  async function sendMessage(from, to, action) {
    await channelSendMessage(
      JSON.stringify({
        to,
        from,
        action,
      })
    );
  }

  async function sendMessageOffVideoLocalOfRemote(uid) {
    await channelSendMessage(
      JSON.stringify({
        to: uid,
        from: currentUser?.id,
        action: "OFF_VIDEO",
      })
    );
  }

  async function sendMessageOffAudioLocalOfRemote(uid) {
    await channelSendMessage(
      JSON.stringify({
        to: uid,
        from: currentUser?.id,
        action: "OFF_AUDIO",
      })
    );
  }

  async function sendMessageOnVideoLocalOfRemote(uid) {
    await channelSendMessage(
      JSON.stringify({
        to: uid,
        from: currentUser?.id,
        action: "ON_VIDEO",
      })
    );
  }

  async function sendMessageOnAudioLocalOfRemote(uid) {
    await channelSendMessage(
      JSON.stringify({
        to: uid,
        from: currentUser?.id,
        action: "ON_AUDIO",
      })
    );
  }

  async function sendMessageAllowJoinMC(uid) {
    await channelSendMessage(
      JSON.stringify({
        to: uid,
        from: currentUser?.id,
        action: "ACCESS_JOIN_MC",
      })
    );
  }

  async function sendMessageRemoveJoinMC(uid) {
    await channelSendMessage(
      JSON.stringify({
        to: uid,
        from: currentUser?.id,
        action: "REMOVE_JOIN_MC",
      })
    );
  }

  async function ketThucHonLe() {
    await channelSendMessage(
      JSON.stringify({
        to: "ALL",
        from: currentUser?.id,
        action: ACTIONS_REMOTE.KET_THUC_HON_LE,
      })
    );
  }

  async function muteVideoTrackRemoteUser(user) {
    setRemoteUsers((remoteUsers) => {
      return {
        ...remoteUsers,
        [user?.uid]: {
          ...remoteUsers?.[user?.uid],
          onCam: false,
        },
      };
    });
    // await client?.unsubscribe(user, "video");
  }

  async function muteAudioTrackRemoteUser(user) {
    setRemoteUsers((remoteUsers) => {
      return {
        ...remoteUsers,
        [user?.uid]: {
          ...remoteUsers?.[user?.uid],
          onMic: false,
        },
      };
    });
    // await client?.unsubscribe(user, "audio");
  }

  async function onVideoTrackRemoteUser(user) {
    setRemoteUsers((remoteUsers) => {
      return {
        ...remoteUsers,
        [user?.uid]: {
          ...remoteUsers?.[user?.uid],
          onCam: true,
        },
      };
    });
    // await client?.subscribe(user, "video");
  }

  async function onAudioTrackRemoteUser(user) {
    setRemoteUsers((remoteUsers) => {
      return {
        ...remoteUsers,
        [user?.uid]: {
          ...remoteUsers?.[user?.uid],
          onMic: true,
        },
      };
    });
    // await client?.subscribe(user, "audio");
  }

  async function subVideoTrackRemoteUser(user) {
    setRemoteUsers((remoteUsers) => {
      return {
        ...remoteUsers,
        [user?.uid]: {
          ...remoteUsers?.[user?.uid],
          onCam: true,
        },
      };
    });
    await client?.subscribe(user, "video");
  }

  async function subAudioTrackRemoteUser(user) {
    setRemoteUsers((remoteUsers) => {
      return {
        ...remoteUsers,
        [user?.uid]: {
          ...remoteUsers?.[user?.uid],
          onMic: true,
        },
      };
    });
    await client?.subscribe(user, "audio");
  }

  async function getDevices() {
    const mics1 = await AgoraRTC.getMicrophones();
    setCurrentMic(mics1[0]);
    setMics(mics1);
    const cams1 = await AgoraRTC.getCameras();
    setCurrentCam(cams1[0]);
    setCams(cams1);
  }

  async function offPublishVideo() {
    setVideoOn(false);
    await localVideoTrack?.setMuted(true);
    await sendMessage(
      holdAction?.to,
      holdAction?.from,
      ACTIONS_REMOTE.OFF_VIDEO_SS
    );
  }

  async function onPublishVideo() {
    setVideoOn(true);
    await localVideoTrack?.setMuted(false);
    await sendMessage(
      holdAction?.to,
      holdAction?.from,
      ACTIONS_REMOTE.ON_VIDEO_SS
    );
  }

  async function offPublishAudio() {
    setAudioOn(false);
    await localAudioTrack?.setMuted(true);
    await sendMessage(
      holdAction?.to,
      holdAction?.from,
      ACTIONS_REMOTE.OFF_AUDIO_SS
    );
  }

  async function onPublishAudio() {
    setAudioOn(true);
    await localAudioTrack?.setMuted(false);
    await sendMessage(
      holdAction?.to,
      holdAction?.from,
      ACTIONS_REMOTE.ON_AUDIO_SS
    );
  }

  async function trigPublishVideo() {
    if (videoOn) {
      setVideoOn(false);
      localVideoTrack?.setMuted(true);
    } else {
      setVideoOn(true);
      localVideoTrack?.setMuted(false);
    }
  }

  async function triPublishAudio() {
    if (audioOn) {
      setAudioOn(false);
      localAudioTrack?.setMuted(true);
    } else {
      setAudioOn(true);
      localAudioTrack?.setMuted(false);
    }
  }

  async function createLocalTracks(audioConfig = {}, videoConfig = {}) {
    const [
      microphoneTrack,
      cameraTrack,
    ] = await AgoraRTC.createMicrophoneAndCameraTracks(
      audioConfig,
      videoConfig
    );
    setLocalAudioTrack(microphoneTrack);
    setLocalVideoTrack(cameraTrack);
    setVideoOn(true);
    setAudioOn(true);
    return [microphoneTrack, cameraTrack];
  }

  async function switchCamera(currentCam) {
    setCurrentCam(currentCam);
    // switch device of local video track.
    await localVideoTrack?.setDevice(currentCam.deviceId);
  }

  async function switchMicrophone(currentMic) {
    setCurrentMic(currentMic);
    // switch device of local audio track.
    await localAudioTrack?.setDevice(currentMic.deviceId);
  }

  async function join(
    appid,
    channel,
    token = null,
    uid = null,
    role
    // tokenRtm
  ) {
    if (!client) return;
    await client.setClientRole(role);
    setRole(role);
    await client.join(appid, channel, token, uid);
    window.client = client;
    if (role === "host") {
      // await clientRtm.login({ uid: uid?.toString(), token: tokenRtm });
      // await channelRtm.join();
      // await clientRtm.setLocalUserAttributes({
      //   id: uid?.toString(),
      // });
      const [microphoneTrack, cameraTrack] = await createLocalTracks();
      await client.publish([microphoneTrack, cameraTrack]);
      window.videoTrack = cameraTrack;
    }
    setJoinState(true);
  }

  async function joinRtmChannel(uid, token) {
    await clientRtm?.login({ uid, token });
    await channelRtm?.current?.join();
    // await clientRtm.setLocalUserAttributes({
    //   id: uid?.toString(),
    // });
  }

  async function channelSendMessage(msg) {
    await channelRtm?.current?.sendMessage({ text: msg });
  }

  async function leave(isLeaveRtm = true) {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    setAction(null);
    await client?.leave();
    setRemoteUsers({});
    setRemoteUsersStatus([]);
    setJoinState(false);
    isLeaveRtm && (await channelRtm?.current?.leave());
    isLeaveRtm && (await clientRtm?.logout());
  }

  useEffect(() => {
    if (!client) return;
    setRemoteUsersStatus(client.remoteUsers);
    getDevices();

    channelRtm.current = clientRtm?.createChannel("CHANNEL_ID_1");

    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      setRemoteUsersStatus((remoteUsers) => Array.from(client.remoteUsers));
    };
    const handleUserUnpublished = (user) => {
      setRemoteUsersStatus((remoteUsers) => Array.from(client.remoteUsers));
    };
    const handleUserJoined = (user) => {
      setRemoteUsersStatus((remoteUsers) => Array.from(client.remoteUsers));
      setRemoteUsers((remoteUsers) => {
        return {
          ...remoteUsers,
          [user?.uid]: {
            ...user,
            onMic: true,
            onCam: true,
            onMicRemoterLocal: true,
            onCamRemoterLocal: true,
          },
        };
      });
    };
    const handleUserLeft = (user) => {
      setRemoteUsersStatus((remoteUsers) => Array.from(client.remoteUsers));
      setRemoteUsers((remoteUsers) => {
        delete remoteUsers?.[user?.uid];
        return remoteUsers;
      });
    };
    // const handleUserInfoUpdate = (user) => {
    //   setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
    // };
    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
    // client.on("user-info-updated", handleUserInfoUpdate);
    channelRtm?.current?.on("ChannelMessage", function(message, memberId) {
      console.log("message, memberId", JSON.parse(message?.text), memberId);
      try {
        const parseSignal = JSON.parse(message?.text);
        if (parseSignal?.to === "ALL") {
          return setAction(parseSignal);
        }
        setCurrentUser((currentUser) => {
          if (parseSignal) {
            if (parseSignal?.to === currentUser?.id) {
              setAction(parseSignal);
            }
          }
          return currentUser;
        });
      } catch (error) {}
    });
    // Display channel member stats
    channelRtm?.current?.on("MemberJoined", function(memberId) {
      console.log("MemberJoined", memberId);
    });
    // Display channel member stats
    channelRtm?.current?.on("MemberLeft", function(memberId) {
      console.log("MemberLeft", memberId);
    });

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
    };
  }, []);

  return {
    localAudioTrack,
    localVideoTrack,
    joinState,
    leave,
    join,
    remoteUsers,
    remoteUsersStatus,
    role,
    trigPublishVideo,
    triPublishAudio,
    videoOn,
    audioOn,
    switchCamera,
    switchMicrophone,
    mics,
    cams,
    currentCam,
    currentMic,
    muteVideoTrackRemoteUser,
    muteAudioTrackRemoteUser,
    subVideoTrackRemoteUser,
    subAudioTrackRemoteUser,
    channelSendMessage,
    joinRtmChannel,
    sendMessageOffVideoLocalOfRemote,
    sendMessageOnVideoLocalOfRemote,
    sendMessageOffAudioLocalOfRemote,
    sendMessageOnAudioLocalOfRemote,
    setCurrentUser,
    onVideoTrackRemoteUser,
    onAudioTrackRemoteUser,
    ketThucHonLe,
    endHonLe,
    setEndHonLe,
    sendMessageAllowJoinMC,
    sendMessageRemoveJoinMC,
  };
}
