import {
  Box,
  FormLabel,
  Input,
  VStack,
  FormControl,
  FormErrorMessage,
  Button,
  SimpleGrid,
  Wrap,
  WrapItem,
  Center,
  FormHelperText,
  ListItem,
  OrderedList,
  Text,
  Select,
  Switch,
  HStack,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { TYPE_USER } from "../utils/constants";
import { supabaseClient } from "../utils/supabaseClient";
import HostWedding from "../components/HostWedding";
import UserWedding from "../components/UserWedding";

const CHANNELS = "channels";
const USERS = "users";
const WEDDINGS = "weddings";

function Main() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [wedding, setWedding] = useState(null);

  const [started, setStarted] = useState(false);

  function validateUserName(value) {
    let error;
    if (!value) {
      error = "user name is required";
    }
    return error;
  }

  function validatePassword(value) {
    let error;
    if (!value) {
      error = "password is required";
    }
    return error;
  }

  function validateChannelName(value) {
    let error;
    if (!value) {
      error = "channel name is required";
    }
    return error;
  }

  function validateChannel(value) {
    let error;
    if (!value) {
      error = "channel is required";
    }
    return error;
  }

  const handleSubmit = async (values, actions) => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from("users")
      .select()
      .textSearch("user_name", values.user_name)
      .textSearch("password", values.password);
    setUser(data?.[0]);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.type === "host") {
      user?.id && getListChannel();
      user?.id && getCurrentWedding();
    } else {
      user?.id && getUserNormal();
    }
  }, [user?.id]);

  const getUserNormal = async () => {
    const { data, error } = await supabaseClient
      .from(USERS)
      .select()
      .eq("id", user?.id);
    if (data?.[0]) {
      setUser(data?.[0]);
      await weddingOfRemote(data?.[0]?.wedding_id);
    }
  };

  const weddingOfRemote = async (id) => {
    const { data, error } = await supabaseClient
      .from(WEDDINGS)
      .select()
      .eq("id", id);
    setWedding(data?.[0]);
    const { data: data1, error: error1 } = await supabaseClient
      .from(CHANNELS)
      .select()
      .eq("wedding_id", id);
    setChannels(data1);
  };

  useEffect(() => {
    if (user?.type === "host") {
      wedding?.id && getListUser();
    }
  }, [wedding?.id]);

  const getListChannel = async () => {
    const { data, error } = await supabaseClient
      .from(CHANNELS)
      .select()
      .eq("owner", user?.id);
    setChannels(data);
  };

  const getListUser = async () => {
    const { data, error } = await supabaseClient
      .from(USERS)
      .select()
      .eq("wedding_id", wedding?.id);
    setUsers(data);
  };

  const getCurrentWedding = async () => {
    const { data, error } = await supabaseClient
      .from(WEDDINGS)
      .select()
      .eq("isDone", false)
      .eq("owner", user?.id)
      .order("id", { ascending: false });
    setWedding(data?.[0]);
  };

  const _renderLogin = () => {
    return (
      <Box bg="main.3" px="16" py="8" borderRadius="2xl">
        <Formik
          initialValues={{ user_name: "", password: "" }}
          onSubmit={handleSubmit}
        >
          {(props) => (
            <Form>
              <Field name="user_name" validate={validateUserName}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.user_name && form.touched.user_name}
                  >
                    <FormLabel htmlFor="user_name" color="white">
                      username
                    </FormLabel>
                    <Input
                      {...field}
                      id="user_name"
                      placeholder="user_name"
                      color="white"
                    />
                    <FormErrorMessage>{form.errors.user_name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Box height="4" />
              <Field name="password" validate={validatePassword}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={form.errors.password && form.touched.password}
                  >
                    <FormLabel htmlFor="password" color="white">
                      password
                    </FormLabel>
                    <Input
                      {...field}
                      id="password"
                      placeholder="password"
                      color="white"
                      type="password"
                    />
                    <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Button
                mt={4}
                colorScheme="teal"
                isLoading={loading}
                type="submit"
                backgroundColor="main.4"
              >
                Log in
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    );
  };

  const handleCreateUser = async (values, actions) => {
    setLoading(true);
    const { data, error } = await supabaseClient.from("users").insert([
      {
        user_name: values?.username,
        channel_can_join: values?.channel,
        type: TYPE_USER.NORMAL,
        wedding_id: wedding?.id,
      },
    ]);
    getListUser();
    setLoading(false);
  };

  const handleCreateChannel = async (values, actions) => {
    setLoading(true);
    const { data, error } = await supabaseClient.from(CHANNELS).insert([
      {
        name_channel: values.channel_name,
        owner: user?.id,
        isAllCanJoin: values?.for_all,
        wedding_id: wedding?.id,
      },
    ]);
    setLoading(false);
    getListChannel();
  };

  const handleStart = () => {
    setStarted(true);
  };

  const _renderHost = () => {
    return (
      <SimpleGrid width="100vw" height="100vh" columns={2}>
        <Box
          bg="main.1"
          height="50vh"
          borderWidth={1}
          borderColor="main.4"
          p="4"
        >
          <Text fontWeight="bold">{wedding?.name}</Text>
          <Box height="4" />
          <h1>Create channel online</h1>
          <Box height="4" />
          <Formik
            initialValues={{ channel_name: "", for_all: false }}
            onSubmit={handleCreateChannel}
          >
            {(props) => (
              <Form>
                <Field name="channel_name" validate={validateChannelName}>
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={
                        form.errors.channel_name && form.touched.channel_name
                      }
                    >
                      <FormLabel htmlFor="channel_name">channel_name</FormLabel>
                      <Input
                        {...field}
                        id="channel_name"
                        placeholder="channel_name"
                      />
                      <FormErrorMessage>
                        {form.errors.channel_name}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Box height="4" />
                <Field name="for_all">
                  {({ field, form }) => (
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="for_all" mb="0">
                        All can join
                      </FormLabel>
                      <Switch id="for_all" {...field} />
                    </FormControl>
                  )}
                </Field>
                <Button
                  mt={4}
                  colorScheme="teal"
                  isLoading={loading}
                  type="submit"
                >
                  Create
                </Button>
              </Form>
            )}
          </Formik>
          <Box height="4" />
          <h1>List channel</h1>
          <Box>
            <OrderedList>
              {channels?.map((item) => (
                <ListItem key={item?.id}>
                  <Text>{item?.name_channel}</Text>
                </ListItem>
              ))}
            </OrderedList>
          </Box>
        </Box>
        <Box
          bg="main.1"
          height="50vh"
          borderWidth={1}
          borderColor="main.4"
          p="4"
        >
          <h1>Create user online</h1>
          <Box height="4" />
          <Formik
            initialValues={{ username: "", channel: "" }}
            onSubmit={handleCreateUser}
          >
            {(props) => (
              <Form>
                <Field name="username" validate={validateUserName}>
                  {({ field, form }) => (
                    <FormControl
                      isInvalid={form.errors.username && form.touched.username}
                    >
                      <FormLabel htmlFor="username">username</FormLabel>
                      <Input {...field} id="username" placeholder="username" />
                      <FormErrorMessage>
                        {form.errors.username}
                      </FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Box height="4" />
                <Field name="channel" validate={validateChannel}>
                  {({ field, form }) => (
                    <FormControl id="channel">
                      <FormLabel>channel</FormLabel>
                      <Select {...field} placeholder="Select channel">
                        {channels
                          ?.filter((item) => !item?.isAllCanJoin)
                          ?.map((item) => (
                            <option key={item?.id} value={item?.id}>
                              {item?.name_channel}
                            </option>
                          ))}
                      </Select>
                      <FormErrorMessage>{form.errors.channel}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Button
                  mt={4}
                  colorScheme="teal"
                  isLoading={loading}
                  type="submit"
                >
                  Create
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
        <Box
          bg="main.1"
          height="50vh"
          borderWidth={1}
          borderColor="main.4"
          p="4"
        >
          <OrderedList>
            {users?.map((item) => (
              <ListItem key={item?.id}>
                <HStack>
                  <Text>{`username: ${item?.user_name} - pass: ${item?.password}`}</Text>
                </HStack>
              </ListItem>
            ))}
          </OrderedList>
        </Box>
        <Center bg="main.1" height="50vh" borderWidth={1} borderColor="main.4">
          <Button
            colorScheme="teal"
            size="md"
            backgroundColor="main.4"
            onClick={handleStart}
          >
            Start
          </Button>
        </Center>
      </SimpleGrid>
    );
  };

  const _renderUser = () => {
    return (
      <Box width="100%">
        {started ? (
          <UserWedding
            wedding={wedding}
            channels={channels}
            user={user}
            stop={() => setStarted(false)}
          />
        ) : (
          _renderPreJoinUser()
        )}
      </Box>
    );
  };

  const _renderPreJoinUser = () => {
    return (
      <Center width="100%">
        <Button
          colorScheme="teal"
          size="lg"
          backgroundColor="main.4"
          onClick={() => setStarted(true)}
        >
          Join Now
        </Button>
      </Center>
    );
  };

  const _renderStartWedding = () => {
    return (
      <Box width="100%">
        <HostWedding
          wedding={wedding}
          channels={channels}
          user={user}
          stop={() => setStarted(false)}
        />
      </Box>
    );
  };

  const handleCreateWedding = async (values, action) => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from(WEDDINGS)
      .insert([{ name: values?.wedding_name, owner: user?.id, isDone: false }]);
    setWedding(data?.[0]);
    setLoading(false);
  };

  const _renderCreateWedding = () => {
    return (
      <Box>
        <h1>Create wedding online</h1>
        <Box height="4" />
        <Formik
          initialValues={{ wedding_name: "" }}
          onSubmit={handleCreateWedding}
        >
          {(props) => (
            <Form>
              <Field name="wedding_name" validate={validateChannelName}>
                {({ field, form }) => (
                  <FormControl
                    isInvalid={
                      form.errors.wedding_name && form.touched.wedding_name
                    }
                  >
                    <FormLabel htmlFor="wedding_name">wedding_name</FormLabel>
                    <Input
                      {...field}
                      id="wedding_name"
                      placeholder="wedding_name"
                    />
                    <FormErrorMessage>
                      {form.errors.wedding_name}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Button
                mt={4}
                colorScheme="teal"
                isLoading={loading}
                type="submit"
              >
                Create
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    );
  };

  return (
    <VStack backgroundColor="main.1" justify="center" height="100vh">
      {user ? (
        <>
          {wedding ? (
            <>
              {user?.type === "host" && started && _renderStartWedding()}
              {user?.type === "host" && !started && _renderHost()}
              {user?.type === "normal" && _renderUser()}
            </>
          ) : (
            _renderCreateWedding()
          )}
        </>
      ) : (
        _renderLogin()
      )}
    </VStack>
  );
}

export default Main;
