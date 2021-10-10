import {
  Box,
  Text,
  SimpleGrid,
  Button,
  Input,
  List,
  ListItem,
  ListIcon,
  HStack,
  Select,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { supabaseClient } from "../utils/supabaseClient";
import {
  MdChalet,
  MdVideocam,
  MdVideocamOff,
  MdMic,
  MdMicOff,
} from "react-icons/md";
// import AgoraRTC from "agora-rtc-sdk";
import AgoraRTC from "agora-rtc-sdk-ng";
import useAgora from "../hooks/useAgora";
import MediaPlayer from "./MediaPlayer";
import { v4 as uuidv4 } from "uuid";
import AgoraRTM from "agora-rtm-sdk";

const config = {
  mode: "live",
  codec: "h264",
};

const client = AgoraRTC.createClient(config);

const APP_ID = process.env.NEXT_PUBLIC_APP_ID;

const clientRtm = AgoraRTM.createInstance(APP_ID);

function Demo() {
  //   const { isLoading, error, data } = useQuery("repoData", () =>
  //     fetch("api/getToken?id=").then((res) => res.json())
  //   );
  const [user, setUser] = useState({});
  const [nameChanel, setNameChanel] = useState("");
  const [currentToken, setCurrentToken] = useState("");
  const [listChanel, setListChanel] = useState([]);

  const [start, setStart] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);

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
  } = useAgora(client, clientRtm);

  console.log("remoteUsers", remoteUsersStatus);

  useEffect(() => {
    getListChanel();
    const mySubscription = supabaseClient
      .from("user_streaming")
      .on("*", (payload) => {
        getListChanel();
      })
      .subscribe();
    return () => {
      supabaseClient.removeSubscription(mySubscription);
    };
  }, [user?.id]);

  const handleCreateUser = async () => {
    const { data, error } = await supabaseClient
      .from("user_streaming")
      .insert([{}]);
    if (data?.[0]) {
      setUser(data?.[0]);
      setCurrentUser(data?.[0]);
      if (!loggedIn) {
        const token = await getTokenRTM(data?.[0]?.id);
        await joinRtmChannel(data?.[0]?.id?.toString(), token);
      }
      setLoggedIn(true);
    }
  };

  const getListChanel = async () => {
    const { data, error } = await supabaseClient
      .from("user_streaming")
      .select()
      .neq("token", null)
      .order("id", { ascending: false });
    if (data) {
      setListChanel(data);
    }
  };

  const handleSetNameChanel = (e) => {
    setNameChanel(e.target.value);
  };

  const leaveChanel = async (isLeaveRtm = true) => {
    try {
      setLoggedIn(false);
      setNameChanel("");
      setCurrentToken("");
      await leave(isLeaveRtm);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateChanel = async () => {
    if (!user?.id) return alert("Please create a user");
    const token = await fetch(
      `api/getToken?id=${user?.id}&chanel=${nameChanel}&role=1`
    )
      .then((res) => res.json())
      .then((data) => data?.token);
    if (token) {
      const { data, error } = await supabaseClient
        .from("user_streaming")
        .update({ name_chanel: uuidv4(), token })
        .match({ id: user?.id });
      getListChanel();
      return;
    }
  };

  const handleError = (error) => {
    console.log("handleError", error);
  };

  const getTokenRTM = async (id) => {
    if (!id) return alert("Please create new user");
    const token = await fetch(`api/getTokenRmt?id=${id}`)
      .then((res) => res.json())
      .then((data) => data?.token);
    if (!token) return;
    return token;
  };

  const connectChanelAsAudience = async (chanel) => {
    if (!user?.id) return alert("Please create new user");
    await leaveChanel(false);
    const token = await fetch(
      `api/getToken?id=${user?.id}&chanel=${chanel}&role=2`
    )
      .then((res) => res.json())
      .then((data) => data?.token);
    if (!token) return alert("Error");
    setNameChanel(chanel);
    await join(APP_ID, chanel, token, user?.id, "audience");
  };

  const connectChanelAsHost = async (chanel) => {
    if (!user?.id) return alert("Please create new user");
    await leaveChanel(false);
    const token = await fetch(
      `api/getToken?id=${user?.id}&chanel=${chanel}&role=1`
    )
      .then((res) => res.json())
      .then((data) => data?.token);
    if (!token) return alert("Error");
    setNameChanel(chanel);
    setCurrentToken(token);
    await join(APP_ID, chanel, token, user?.id, "host");
  };

  const onChangeCam = (e) => {
    const cam = cams?.filter((item) => item?.deviceId === e.target.value)?.[0];
    switchCamera(cam);
  };

  const onChangeMic = (e) => {
    const mic = mics?.filter((item) => item?.deviceId === e.target.value)?.[0];
    switchMicrophone(mic);
  };

  const requestJoinChanel = async (channelId) => {
    // if (!user?.id) return alert("Please create new user");
    // const tokenRTM = await getTokenRTM();
    // await joinRtmChannel(user?.id, tokenRTM);
    // await channelSendMessage(
    //   JSON.stringify({ user: user?.id, channelId, type: "request" })
    // );
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

  function imagedata_to_image(imagedata) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = imagedata.width;
    canvas.height = imagedata.height;
    ctx.putImageData(imagedata, 0, 0);

    var image = new Image();
    image.src = canvas.toDataURL();
    console.log("image", image.src);
    return image;
  }

  const handleScreenShot = async () => {
    // const currentFrame = localVideoTrack?.getCurrentFrameData();
    // imagedata_to_image(currentFrame);
    let body = JSON.stringify({
      cname: nameChanel,
      uid: user?.id + "",
      clientRequest: {
        resourceExpiredHour: 24,
        scene: 0,
      },
    });
    let rs = await fetch(
      `https://api.agora.io/v1/apps/${APP_ID}/cloud_recording/acquire`,
      {
        method: "post",
        body: body,
        headers: {
          "Content-type": "application/json;charset=utf-8",
          Authorization:
            "Basic ZTg3ZjRlMzg5ODkyNDU5M2I1NzA3MzZjMGI2OTMzYWY6NjA2YzQ1NGZlNzEzNDU2NmFmYTgyODE5ZGMwOTRjNWM=",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => res)
      .catch(() => null);
    if (rs?.resourceId) {
      body = JSON.stringify({
        cname: nameChanel,
        uid: user?.id + "",
        clientRequest: {
          token: currentToken,
          recordingConfig: {
            channelType: 1,
            subscribeUidGroup: 0,
          },
          snapshotConfig: {
            captureInterval: 5,
            fileType: ["jpg"],
          },
          storageConfig: {
            accessKey: process.env.NEXT_PUBLIC_APP_ACCESS_KEY,
            region: 8,
            bucket: "wedding-online",
            secretKey: process.env.NEXT_PUBLIC_APP_SECRET_KEY,
            vendor: 1,
            fileNamePrefix: [],
          },
        },
      });
      let rs2 = await fetch(
        `https://api.agora.io/v1/apps/${APP_ID}/cloud_recording/resourceid/${rs?.resourceId}/mode/individual/start`,
        {
          method: "post",
          body: body,
          headers: {
            "Content-type": "application/json;charset=utf-8",
            Authorization:
              "Basic ZTg3ZjRlMzg5ODkyNDU5M2I1NzA3MzZjMGI2OTMzYWY6NjA2YzQ1NGZlNzEzNDU2NmFmYTgyODE5ZGMwOTRjNWM=",
          },
        }
      )
        .then((res) => res.json())
        .then((res) => {
          return res;
        })
        .catch(() => null);
      if (rs2?.sid) {
        let rs3 = await fetch(
          `http://api.agora.io/v1/apps/${APP_ID}/cloud_recording/resourceid/${rs?.resourceId}/sid/${rs2?.sid}/mode/individual/stop`,
          {
            method: "post",
            body: JSON.stringify({
              cname: nameChanel,
              uid: user?.id + "",
              clientRequest: {},
            }),
            headers: {
              "Content-type": "application/json;charset=utf-8",
              Authorization:
                "Basic ZTg3ZjRlMzg5ODkyNDU5M2I1NzA3MzZjMGI2OTMzYWY6NjA2YzQ1NGZlNzEzNDU2NmFmYTgyODE5ZGMwOTRjNWM=",
            },
          }
        )
          .then((res) => res.json())
          .then((res) => {
            return res;
          })
          .catch(() => null);
        console.log("rs3", rs3);
      }
    }
  };

  return (
    <SimpleGrid w="100vm" height="100vh" columns={2} spacing={2}>
      <Box
        display="flex"
        flexDirection="column"
        bg="transparent"
        p="4"
        height="50vh"
      >
        <Button colorScheme="green" maxW="xs" onClick={handleCreateUser}>
          Create new user
        </Button>
        <Box height="24px" />
        {/* <Input
          w="xs"
          placeholder="Enter a name chanel"
          onChange={handleSetNameChanel}
        />
        <Box height="8px" /> */}
        <Button colorScheme="yellow" maxW="xs" onClick={handleCreateChanel}>
          Create chanel with user {user?.id}
        </Button>
        <Box height="24px" />
        <Button colorScheme="yellow" maxW="xs" onClick={handleScreenShot}>
          Chụp màn hình
        </Button>
        <Box height="24px" />
        {joinState && (
          <Button colorScheme="red" onClick={leaveChanel} maxW="xs">
            Leave chanel
          </Button>
        )}
        <Box height="24px" />
        {joinState && role === "host" && (
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
        <Box height="24px" />
        {joinState && role === "host" && (
          <HStack>
            <Select onChange={onChangeCam} value={currentCam?.deviceId}>
              {cams?.map((item) => (
                <option key={item?.deviceId} value={item?.deviceId}>
                  {item?.label}
                </option>
              ))}
            </Select>
            <Select onChange={onChangeMic} value={currentMic?.deviceId}>
              {mics?.map((item) => (
                <option key={item?.deviceId} value={item?.deviceId}>
                  {item?.label}
                </option>
              ))}
            </Select>
          </HStack>
        )}
      </Box>
      <Box bg="gray.100" height="50vh" p="4" overflow="scroll">
        <Text fontSize="xl">List chanel</Text>
        <List spacing={3}>
          {listChanel?.map((chanel) => {
            return (
              <ListItem
                key={chanel?.id}
                cursor="pointer"
                fontSize="xs"
                fontWeight="bold"
                color={user?.id === chanel?.id ? "green" : "black"}
              >
                <ListIcon as={MdChalet} color="green.500" />
                Table-{chanel?.id}
                <Button
                  ml="2"
                  colorScheme="red"
                  onClick={() => connectChanelAsHost(chanel?.name_chanel)}
                >
                  as HOST
                </Button>
                <Button
                  ml="2"
                  colorScheme="teal"
                  onClick={() => connectChanelAsAudience(chanel?.name_chanel)}
                >
                  as AUDIENCE
                </Button>
                {/* <Button
                  ml="2"
                  colorScheme="facebook"
                  onClick={() => requestJoinChanel(chanel?.id)}
                >
                  request JOIN
                </Button> */}
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Box bg="cornflowerblue" height="50vh" id="me">
        {role === "host" && (
          <MediaPlayer
            videoTrack={localVideoTrack}
            audioTrack={undefined}
            style={null}
          ></MediaPlayer>
        )}
      </Box>
      <Box
        bg="cornflowerblue"
        height="50vh"
        overflow="scroll"
        flexWrap="wrap"
        flexDirection="row"
        display="flex"
      >
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
      </Box>
    </SimpleGrid>
  );
}

export default Demo;
