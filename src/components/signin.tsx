import { useState } from "react";
import { Link, useRouter, useSearch } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff, Loader } from "lucide-react";

import { loginSchema } from "@/validators/loginSchema";
import { useAuth } from "@/hooks/useAuth";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";

const Signin = () => {
  const router = useRouter();
  const { login } = useAuth();
  // get search params for sigin page
  const { redirect: redirectUrl } = useSearch({ from: "/_authLayout/signin" });
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await login(value.email, value.password);
        toast.success("Login successful");
        // invalidate the router to force re-evaluation of route context with new auth state
        await router.invalidate();
        // if redirect url is provided redirect to that page else redirect to landing page as fallback
        await router.navigate({
          to: redirectUrl && redirectUrl !== "signup" ? redirectUrl : "/",
        });
      } catch (error) {
        console.log(error);
        toast.error("Login failed" + error);
      } finally {
        form.reset();
      }
    },
  });
  return (
    <Card className="w-full max-w-xs sm:max-w-md">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email and password below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
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
                        variant="ghost"
                        size="icon"
                        type="button"
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Field>
          <Button
            type="submit"
            form="login-form"
            className="w-full rounded-md"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting ? (
              <Loader className="animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
          <div className="flex items-center justify-center gap-2">
            <span>Don't have an account?</span>
            <Link
              search={{ redirect: "/signup" }}
              to="/signup"
              className="text-primary"
            >
              Sign Up
            </Link>
          </div>
        </Field>
      </CardFooter>
    </Card>
  );
};

export default Signin;
