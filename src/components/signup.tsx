import { useState } from "react";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { registerSchema } from "@/validators/registerSchema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";

const Signup = () => {
  const { register } = useAuth();
  const router = useRouter();
  const { redirect: redirectUrl } = useSearch({ from: "/_authLayout/signup" });

  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      phoneNumber: "",
      userName: "",
      consents: [
        {
          consentType: "PRIVACY_POLICY",
          accepted: false,
        },
        {
          consentType: "TERMS_AND_CONDITIONS",
          accepted: false,
        },
      ],
    },
    validators: {
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await register(
          value.userName,
          value.email,
          value.phoneNumber,
          value.password,
          value.consents,
        );
        toast.success("User registered successfully");
        await router.navigate({
          to: "/signin",
          search: undefined!,
        });
      } catch (error) {
        console.log(error);
        toast.error("Registration failed " + error);
      } finally {
        form.reset();
      }
    },
  });
  return (
    <Card className="w-full max-w-xs sm:max-w-sm">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="register-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="userName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      // autoComplete="on"
                      placeholder="myusername"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="on"
                      placeholder="myemail@mail.com"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="phoneNumber"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="tel"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="on"
                      placeholder="+123456789"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <div className="relative overflow-hidden">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={passwordVisibility ? "text" : "password"}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        autoComplete="off"
                        className="relative"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setPasswordVisibility((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {passwordVisibility ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="consents"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const allAccepted = field.state.value.every(
                  (consent) => consent.accepted,
                );
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="consents-all"
                        checked={allAccepted}
                        onCheckedChange={(checked) => {
                          field.handleChange(
                            field.state.value.map((consent) => {
                              return {
                                ...consent,
                                accepted: checked === true,
                              };
                            }),
                          );
                        }}
                      />
                      <div className="pl-2">
                        <FieldLabel
                          htmlFor="consents-all"
                          className="break-normal leading-tight inline-block"
                        >
                          I agree to the{" "}
                          <Link to="/" className="text-primary">
                            Privacy Policy
                          </Link>{" "}
                          and{" "}
                          <Link to="/" className="text-primary">
                            Terms of Service
                          </Link>
                        </FieldLabel>
                      </div>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          form="register-form"
          className="w-full"
          disabled={form.state.isSubmitting}
        >
          {form.state.isSubmitting ? (
            <Loader className="animate-spin" />
          ) : (
            "Sign Up"
          )}
        </Button>
        <div className="flex items-center justify-center gap-2">
          <span>Already have an account?</span>
          <Link
            search={{ redirect: redirectUrl }}
            to="/signin"
            className="text-primary"
          >
            Sign In
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Signup;
