import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Select,
  IconButton,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import useAgora from "../hooks/useAgora";
import MediaPlayer from "./MediaPlayer";
import { v4 as uuidv4 } from "uuid";
import AgoraRTM from "agora-rtm-sdk";
import {
  MdChalet,
  MdVideocam,
  MdVideocamOff,
  MdMic,
  MdMicOff,
} from "react-icons/md";

const config = {
  mode: "live",
  codec: "h264",
};

const client = AgoraRTC.createClient(config);

const APP_ID = process.env.NEXT_PUBLIC_APP_ID;

const clientRtm = AgoraRTM.createInstance(APP_ID);

function HostWedding({ wedding, channels, user, stop }) {
  const {
    localAudioTrack,
    localVideoTrack,
    leave,
    join,
    joinState,
    remoteUsers,
    role,
    trigPublishVideo,
    triPublishAudio,
    videoOn,
    audioOn,
    cams,
    mics,
    switchCamera,
    switchMicrophone,
    currentCam,
    currentMic,
    muteVideoTrackRemoteUser,
    muteAudioTrackRemoteUser,
    channelSendMessage,
    joinRtmChannel,
    remoteUsersStatus,
    sendMessageOffVideoLocalOfRemote,
    sendMessageOnVideoLocalOfRemote,
    sendMessageOffAudioLocalOfRemote,
    sendMessageOnAudioLocalOfRemote,
    setCurrentUser,
    ketThucHonLe,
  } = useAgora(client, clientRtm);

  useEffect(() => {}, [wedding]);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    startLive();
  }, [channels, user]);

  const onChangeCam = (e) => {
    const cam = cams?.filter((item) => item?.deviceId === e.target.value)?.[0];
    switchCamera(cam);
  };

  const onChangeMic = (e) => {
    const mic = mics?.filter((item) => item?.deviceId === e.target.value)?.[0];
    switchMicrophone(mic);
  };

  const getTokenRTM = async (id) => {
    if (!id) return alert("Please create new user");
    const token = await fetch(`api/getTokenRmt?id=${id}`)
      .then((res) => res.json())
      .then((data) => data?.token);
    if (!token) return;
    return token;
  };

  const startLive = async () => {
    const main = channels?.filter((item) => item.isAllCanJoin)?.[0];
    const chanel = main?.name;
    const token = await fetch(
      `api/getToken?id=${user?.id}&chanel=${chanel}&role=1`
    )
      .then((res) => res.json())
      .then((data) => data?.token);
    if (!token) return alert("Error");

    await join(APP_ID, chanel, token, user?.id, "host");

    const tokenRtm = await getTokenRTM(user?.id);
    await joinRtmChannel(user?.id?.toString(), tokenRtm);
  };

  const leaveChanel = async () => {
    try {
      await leave();
      stop();
    } catch (error) {
      console.log(error);
    }
  };

  const muteVideoTrackLocalRemoteUser = async (toUser) => {
    await sendMessageOffVideoLocalOfRemote(toUser?.uid);
  };

  const muteAudioTrackLocalRemoteUser = async (toUser) => {
    await sendMessageOffAudioLocalOfRemote(toUser?.uid);
  };

  const onVideoTrackLocalRemoteUser = async (toUser) => {
    await sendMessageOnVideoLocalOfRemote(toUser?.uid);
  };

  const onAudioTrackLocalRemoteUser = async (toUser) => {
    await sendMessageOnAudioLocalOfRemote(toUser?.uid);
  };

  const nhapTiec = () => {
    ketThucHonLe();
  };

  return (
    <VStack width="100vw" height="100vh" backgroundColor="main.3">
      <Text color="white" fontWeight="bold" fontSize="xl">
        {wedding?.name}
      </Text>
      <HStack width="100vw" height="50vh">
        <VStack
          width="25%"
          height="100%"
          backgroundColor="main.1"
          justifyContent="center"
          alignItems="center"
        >
          {joinState && (
            <HStack>
              <Button
                colorScheme="red"
                rounded="full"
                onClick={() => trigPublishVideo()}
              >
                {/* {`${!videoOn ? "On" : "Off"} video`} */}
                {!videoOn ? <MdVideocam /> : <MdVideocamOff />}
              </Button>
              <Button
                rounded="full"
                colorScheme="red"
                onClick={() => triPublishAudio()}
              >
                {/* {`${!audioOn ? "On" : "Off"} audio`} */}
                {!audioOn ? <MdMic /> : <MdMicOff />}
              </Button>
            </HStack>
          )}
          <Box height="4" />
          {joinState && (
            <VStack>
              <Select onChange={onChangeCam} value={currentCam?.deviceId}>
                {cams?.map((item) => (
                  <option key={item?.deviceId} value={item?.deviceId}>
                    {item?.label}
                  </option>
                ))}
              </Select>
              <Box height="4" />
              <Select onChange={onChangeMic} value={currentMic?.deviceId}>
                {mics?.map((item) => (
                  <option key={item?.deviceId} value={item?.deviceId}>
                    {item?.label}
                  </option>
                ))}
              </Select>
              <Box height="4" />
              <Button colorScheme="red" onClick={() => nhapTiec()} maxW="xs">
                Nhập tiệc
              </Button>
              <Box height="4" />
              <Button colorScheme="red" onClick={leaveChanel} maxW="xs">
                Leave chanel
              </Button>
            </VStack>
          )}
        </VStack>
        <Box width="50%" height="100%" backgroundColor="main.3">
          <MediaPlayer
            videoTrack={localVideoTrack}
            audioTrack={undefined}
            style={null}
          ></MediaPlayer>
        </Box>
        <Box width="25%" height="100%" backgroundColor="main.2"></Box>
      </HStack>
      <HStack width="100vw" height="50vh" overflow="scroll">
        {remoteUsersStatus.map((user) => {
          console.log("user", user);
          return (
            <Box
              key={user.uid}
              w="160px"
              h="25vh"
              bg="blue.900"
              m="2"
              position="relative"
            >
              <MediaPlayer
                videoTrack={user.videoTrack}
                audioTrack={user.audioTrack}
              />
              <VStack
                position="absolute"
                top="0"
                bottom="0"
                left="0"
                right="0"
                backgroundColor="transparent"
                alignItems="flex-start"
                p="2"
                justifyContent="space-between"
              >
                <VStack alignItems="flex-start">
                  <Text color="black" fontSize="12px">
                    {user?.uid || "ON"}
                  </Text>
                  <Text color="black" fontSize="12px">
                    MIC : {user?.hasAudio ? "ON" : "OFF"}
                  </Text>
                  <Text color="black" fontSize="12px">
                    CAM : {user?.hasVideo ? "ON" : "OFF"}
                  </Text>
                </VStack>
                <HStack justifyContent="space-between">
                  <IconButton
                    variant="ghost"
                    icon={
                      !remoteUsers?.[user?.uid]?.onCamRemoterLocal ? (
                        <MdVideocam color="red" />
                      ) : (
                        <MdVideocamOff color="red" />
                      )
                    }
                    onClick={() => {
                      if (remoteUsers?.[user?.uid]?.onCamRemoterLocal) {
                        muteVideoTrackLocalRemoteUser(user);
                      } else {
                        onVideoTrackLocalRemoteUser(user);
                      }
                    }}
                  ></IconButton>
                  <IconButton
                    variant="ghost"
                    icon={
                      !remoteUsers?.[user?.uid]?.onMicRemoterLocal ? (
                        <MdMic color="red" />
                      ) : (
                        <MdMicOff color="red" />
                      )
                    }
                    onClick={() => {
                      if (remoteUsers?.[user?.uid]?.onMicRemoterLocal) {
                        muteAudioTrackLocalRemoteUser(user);
                      } else {
                        onAudioTrackLocalRemoteUser(user);
                      }
                    }}
                  ></IconButton>
                </HStack>
                {/* <HStack justifyContent="space-between">
                  <IconButton
                    variant="ghost"
                    icon={
                      user?._video_muted_ ? <MdVideocam /> : <MdVideocamOff />
                    }
                    onClick={() => muteVideoTrackRemoteUser(user)}
                  ></IconButton>
                  <IconButton
                    variant="ghost"
                    icon={user?._audio_muted_ ? <MdMic /> : <MdMicOff />}
                    onClick={() => muteAudioTrackRemoteUser(user)}
                  ></IconButton>
                </HStack> */}
              </VStack>
            </Box>
          );
        })}
      </HStack>
    </VStack>
  );
}

export default HostWedding;
