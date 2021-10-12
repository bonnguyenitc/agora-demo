import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Select,
  IconButton,
  OrderedList,
  ListItem,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuIcon,
  MenuCommand,
  MenuDivider,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
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

function UserWedding({ wedding, channels, user, stop }) {
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
    onVideoTrackRemoteUser,
    onAudioTrackRemoteUser,
    endHonLe,
  } = useAgora(client, clientRtm);

  const [onCamMain, setOnCamMain] = useState(true);
  const [onMicMain, setOnMicMain] = useState(true);
  const [main, setMain] = useState(null);

  const [currentTable, setCurrentTable] = useState(null);

  useEffect(() => {
    if (endHonLe) {
      leaveAndJoinTable();
    }
  }, [endHonLe]);

  const leaveAndJoinTable = async () => {
    await leave(false);
    const idx = channels?.findIndex(
      (item) => item?.id === user?.channel_can_join
    );
    if (idx > -1) {
      setCurrentTable(channels?.[idx]);
      joinTable(channels?.[idx]);
    }
  };

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    getMain();
  }, [remoteUsersStatus]);

  const getMain = () => {
    const main = remoteUsersStatus?.filter(
      (item) => item?.uid === wedding?.owner
    )?.[0];
    setMain(main);
  };

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

  const joinTable = async (ch) => {
    setCurrentTable(ch);
    await leave(false);
    const chanel = ch?.name;
    const token = await fetch(
      `api/getToken?id=${user?.id}&chanel=${chanel}&role=1`
    )
      .then((res) => res.json())
      .then((data) => data?.token);
    if (!token) return alert("Error");

    await join(APP_ID, chanel, token, user?.id, "host");
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

  const remoteUsersOnline = remoteUsersStatus?.filter(
    (item) => item.uid !== wedding?.owner
  );

  return (
    <VStack width="100vw" height="100vh" backgroundColor="main.3">
      <HStack width="100%" justifyContent="flex-start" p="2">
        <Text color="white" fontWeight="bold" fontSize="xl">
          {wedding?.name}
        </Text>
        <Menu>
          <MenuButton as={Button} rightIcon={null}>
            Table
          </MenuButton>
          <MenuList>
            {channels?.map((item) => {
              return (
                <MenuItem
                  key={item?.id}
                  color={
                    item?.id === user?.channel_can_join || item?.isAllCanJoin
                      ? "green"
                      : "black"
                  }
                  onClick={() => {
                    joinTable(item);
                  }}
                >
                  {item?.name_channel}
                </MenuItem>
              );
            })}
          </MenuList>
        </Menu>
      </HStack>
      <HStack width="100vw" height="50vh">
        <VStack
          width="25%"
          height="100%"
          backgroundColor="main.1"
          justifyContent="center"
          alignItems="center"
        >
          {joinState && (
            <>
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
              <Box height="4" />
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
                <Button colorScheme="red" onClick={leaveChanel} maxW="xs">
                  Leave chanel
                </Button>
              </VStack>
            </>
          )}
        </VStack>
        <Box
          width="50%"
          height="100%"
          backgroundColor="main.4"
          position="relative"
        >
          {main && (
            <>
              <MediaPlayer
                videoTrack={onCamMain ? main.videoTrack : undefined}
                audioTrack={onMicMain ? main.audioTrack : undefined}
              ></MediaPlayer>
              <HStack
                justifyContent="space-between"
                bg="main.3"
                position="absolute"
                bottom="0"
                alignSelf="center"
              >
                <IconButton
                  variant="ghost"
                  icon={
                    !onCamMain ? (
                      <MdVideocam color="red" />
                    ) : (
                      <MdVideocamOff color="red" />
                    )
                  }
                  onClick={async () => {
                    if (onCamMain) {
                      setOnCamMain(false);
                      getMain();
                    } else {
                      setOnCamMain(true);
                      getMain();
                    }
                  }}
                ></IconButton>
                <IconButton
                  variant="ghost"
                  icon={
                    !onMicMain ? (
                      <MdMic color="red" />
                    ) : (
                      <MdMicOff color="red" />
                    )
                  }
                  onClick={async () => {
                    if (onMicMain) {
                      setOnMicMain(false);
                      await muteAudioTrackRemoteUser(main);
                    } else {
                      setOnMicMain(true);
                      await onAudioTrackRemoteUser(main);
                    }
                  }}
                ></IconButton>
              </HStack>
            </>
          )}
        </Box>
        <Box width="25%" height="100%" backgroundColor="main.1">
          <MediaPlayer
            videoTrack={localVideoTrack}
            audioTrack={localAudioTrack}
          ></MediaPlayer>
        </Box>
      </HStack>
      <Text color="white">{currentTable?.name_channel}</Text>
      <HStack width="100vw" height="50vh" overflow="scroll" p="4">
        {remoteUsersStatus
          ?.filter((item) => item.uid !== wedding?.owner)
          .map((user) => {
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
                  videoTrack={
                    remoteUsers?.[user?.uid]?.onCam
                      ? user.videoTrack
                      : undefined
                  }
                  audioTrack={
                    remoteUsers?.[user?.uid]?.onMic
                      ? user.audioTrack
                      : undefined
                  }
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
                        !remoteUsers?.[user?.uid]?.onCam ? (
                          <MdVideocam color="red" />
                        ) : (
                          <MdVideocamOff color="red" />
                        )
                      }
                      onClick={() => {
                        if (remoteUsers?.[user?.uid]?.onCam) {
                          //   muteVideoTrackLocalRemoteUser(user);
                          muteVideoTrackRemoteUser(user);
                        } else {
                          //   onVideoTrackLocalRemoteUser(user);
                          onVideoTrackRemoteUser(user);
                        }
                      }}
                    ></IconButton>
                    <IconButton
                      variant="ghost"
                      icon={
                        !remoteUsers?.[user?.uid]?.onMic ? (
                          <MdMic color="red" />
                        ) : (
                          <MdMicOff color="red" />
                        )
                      }
                      onClick={() => {
                        if (remoteUsers?.[user?.uid]?.onMic) {
                          //   muteAudioTrackLocalRemoteUser(user);
                          muteAudioTrackRemoteUser(user);
                        } else {
                          //   onAudioTrackLocalRemoteUser(user);
                          onAudioTrackRemoteUser(user);
                        }
                      }}
                    ></IconButton>
                  </HStack>
                </VStack>
              </Box>
            );
          })}
      </HStack>
    </VStack>
  );
}

export default UserWedding;
