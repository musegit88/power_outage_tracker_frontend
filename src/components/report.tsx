import { useForm } from "@tanstack/react-form";
import { Link, useLocation } from "@tanstack/react-router";
import { Info, Lightbulb, LightbulbOff, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import api from "@/services/api";
import { reportFormNavigation } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useUserLocation } from "@/hooks/useUserLocation";
import { ApiError } from "@/services/api";
import { createOutageSchema } from "@/validators/createOutage";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import Voltage from "./icons/voltage";
import Minor from "./icons/minor";
import Moderate from "./icons/moderate";
import Severe from "./icons/severe";
import ReportMap from "./maps/report-map";

const Report = () => {
  const { user } = useAuth();
  const { positions } = useUserLocation();
  const location = useLocation();

  const form = useForm({
    defaultValues: {
      userId: user?.id || "",
      locationName: "",
      description: "",
      coordinates: {
        latitude: positions?.lat || 0,
        longitude: positions?.lng || 0,
      },
      affectedHomesEstimated: 1,
      whatHappened: "NO_POWER" as
        | "NO_POWER"
        | "PARTIAL_POWER"
        | "LOW_VOLTAGE"
        | "FLICKERING"
        | "HAZARDOUS_SITUATION"
        | "OTHER",
      severity: "MINOR" as "MINOR" | "MODERATE" | "SEVERE",
    },
    validators: {
      onSubmit: createOutageSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response: { message: string } = await api.createOutage(value);
        console.error(typeof response, response);
        toast.success(response.message);
      } catch (error) {
        console.error(typeof error, error);

        if (error instanceof ApiError) {
          if (error.isRateLimit) {
            // The server returns: { error, message, resetAt, remaining }
            const resetAt = error.data.resetAt
              ? new Date(error.data.resetAt as string).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            toast.error("Rate limit exceeded", {
              description: error.detail
                ? `${error.detail}${resetAt ? ` (resets at ${resetAt})` : ""}`
                : "You've submitted too many reports. Please try again later.",
              duration: 6000,
            });
          } else if (error.isConflict) {
            // The server returns: { error, message, nearbyOutages }
            toast.warning("Outage already reported nearby", {
              description:
                error.detail ??
                "An active outage already exists within 1 km. Please confirm it instead.",
              duration: 6000,
            });
          } else {
            toast.error(error.message, {
              description: error.detail,
            });
          }
        } else {
          toast.error("Failed to report outage");
        }
      } finally {
        form.reset();
      }
    },
  });
  return (
    <div className="flex flex-col bg-muted dark:bg-slate-900">
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col gap-1 p-4">
          <h1 className="text-2xl sm:text-4xl font-bold text-primary">
            Report Outage
          </h1>
          <p className="text-xs sm:text-lg text-muted-foreground">
            Report a power outage and help to restore power as quickly as
            possible.
          </p>
        </div>
        {/* Navigation */}

        <div className="max-w-fit p-4">
          <Card className="w-full px-2 py-1 dark:bg-slate-800 backdrop-filter backdrop-blur-sm border dark:border-slate-700 rounded-md transition-all shadow-sm">
            <CardContent className="flex gap-4 overflow-x-scroll">
              {reportFormNavigation.map((item) => (
                <Link
                  key={item.id}
                  to="/report"
                  hash={item.hash}
                  className={cn(
                    "flex gap-2 px-2 py-1 hover:bg-slate-500/40 rounded-md",
                    location.hash === item.hash &&
                      "bg-slate-500/40 rounded-md ",
                  )}
                >
                  <h4
                    className={cn(
                      "whitespace-nowrap transition-all duration-300",
                      location.hash === item.hash && "font-semibold text-md",
                    )}
                  >
                    {item.title}
                  </h4>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="p-4">
          {/* Form */}
          <div className="h-full overflow-y-scroll">
            <div className="flex flex-col gap-4">
              <form
                id="report-outage-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                <FieldGroup>
                  <div id="location">
                    <Card className="h-[480px] ring-0 dark:bg-slate-800 backdrop-filter backdrop-blur-sm border dark:border-slate-700 rounded-md transition-all shadow-sm">
                      <CardHeader>
                        <CardTitle
                          className={cn(
                            "text-xl font-bold",
                            location.hash === "location" &&
                              "bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent",
                          )}
                        >
                          1. Pin the Location
                        </CardTitle>
                        <CardDescription>
                          Pin the exact location of the service interruption on
                          the map.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-full flex flex-col gap-4">
                        <form.Field
                          name="coordinates"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
                            return (
                              <Field className="h-full">
                                <ReportMap
                                  field={field}
                                  onChange={field.handleChange}
                                />
                                {isInvalid && (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                )}
                              </Field>
                            );
                          }}
                        />
                        <form.Field
                          name="locationName"
                          children={(field) => {
                            const isInvalid =
                              field.state.meta.isTouched &&
                              !field.state.meta.isValid;
                            return (
                              <Field
                                data-invalid={isInvalid}
                                className="sm:w-1/3"
                              >
                                <FieldLabel htmlFor={field.name}>
                                  Location Name
                                </FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  type="text"
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  autoComplete="on"
                                  placeholder="around mall road"
                                />
                                {isInvalid && (
                                  <FieldError
                                    errors={field.state.meta.errors}
                                  />
                                )}
                              </Field>
                            );
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  <div id="details" className="flex flex-col gap-4">
                    <h1
                      className={cn(
                        "text-xl font-bold",
                        location.hash === "details" &&
                          "bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent",
                      )}
                    >
                      2. What happened?
                    </h1>
                    <form.Field
                      name="whatHappened"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <FieldSet>
                            <FieldLegend>What Happened</FieldLegend>

                            <RadioGroup
                              name={field.name}
                              value={field.state.value as string}
                              onValueChange={(val) =>
                                field.handleChange(
                                  val as
                                    | "NO_POWER"
                                    | "PARTIAL_POWER"
                                    | "LOW_VOLTAGE"
                                    | "FLICKERING"
                                    | "HAZARDOUS_SITUATION"
                                    | "OTHER",
                                )
                              }
                              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                            >
                              <FieldLabel htmlFor="no-power">
                                <Field orientation="horizontal">
                                  <FieldContent>
                                    <FieldTitle>
                                      <LightbulbOff color="red" />
                                      No Power
                                    </FieldTitle>
                                    <FieldDescription>
                                      The power is completely out in the area.
                                    </FieldDescription>
                                  </FieldContent>
                                  <RadioGroupItem
                                    value={"NO_POWER"}
                                    id="no-power"
                                    aria-invalid={isInvalid}
                                  />
                                </Field>
                              </FieldLabel>
                              <FieldLabel htmlFor="partial-power">
                                <Field orientation="horizontal">
                                  <FieldContent>
                                    <FieldTitle>
                                      <Lightbulb color="blue" />
                                      Partial Power
                                    </FieldTitle>
                                    <FieldDescription>
                                      The power is partially out in the area.
                                    </FieldDescription>
                                  </FieldContent>
                                  <RadioGroupItem
                                    value={"PARTIAL_POWER"}
                                    id="partial-power"
                                    aria-invalid={isInvalid}
                                  />
                                </Field>
                              </FieldLabel>
                              <FieldLabel htmlFor="low-voltage">
                                <Field orientation="horizontal">
                                  <FieldContent>
                                    <FieldTitle>
                                      <Voltage className="size-6" />
                                      Low Voltage
                                    </FieldTitle>
                                    <FieldDescription>
                                      Low voltage in the area.
                                    </FieldDescription>
                                  </FieldContent>
                                  <RadioGroupItem
                                    value={"LOW_VOLTAGE"}
                                    id="low-voltage"
                                    aria-invalid={isInvalid}
                                  />
                                </Field>
                              </FieldLabel>
                              <FieldLabel htmlFor="flickering">
                                <Field orientation="horizontal">
                                  <FieldContent>
                                    <FieldTitle>
                                      <LightbulbOff color="red" />
                                      Flickering
                                    </FieldTitle>
                                    <FieldDescription>
                                      Flickering in the area.
                                    </FieldDescription>
                                  </FieldContent>
                                  <RadioGroupItem
                                    value={"FLICKERING"}
                                    id="flickering"
                                    aria-invalid={isInvalid}
                                  />
                                </Field>
                              </FieldLabel>
                              <FieldLabel htmlFor="hazard">
                                <Field orientation="horizontal">
                                  <FieldContent>
                                    <FieldTitle>
                                      <TriangleAlert color="red" />
                                      Hazard/Safety
                                    </FieldTitle>
                                    <FieldDescription>
                                      Downed lines, sparking, or fire hazards.
                                    </FieldDescription>
                                  </FieldContent>
                                  <RadioGroupItem
                                    value={"HAZARDOUS_SITUATION"}
                                    id="hazard"
                                    aria-invalid={isInvalid}
                                  />
                                </Field>
                              </FieldLabel>
                              <FieldLabel htmlFor="other">
                                <Field orientation="horizontal">
                                  <FieldContent>
                                    <FieldTitle>
                                      <Info color="blue" />
                                      Other
                                    </FieldTitle>
                                    <FieldDescription>Other.</FieldDescription>
                                  </FieldContent>
                                  <RadioGroupItem
                                    value={"OTHER"}
                                    id="other"
                                    aria-invalid={isInvalid}
                                  />
                                </Field>
                              </FieldLabel>
                            </RadioGroup>
                          </FieldSet>
                        );
                      }}
                    />
                  </div>
                  <div id="context" className="flex flex-col gap-4">
                    <h1
                      className={cn(
                        "text-xl font-bold",
                        location.hash === "context" &&
                          "bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent",
                      )}
                    >
                      3. Additional Context
                    </h1>
                    <div className="flex gap-2">
                      <Card className="flex-1 ring-0 dark:bg-slate-800 backdrop-filter backdrop-blur-sm border dark:border-slate-700 rounded-md transition-all shadow-sm">
                        <CardContent>
                          <form.Field
                            name="description"
                            children={(field) => {
                              const isInvalid =
                                field.state.meta.isTouched &&
                                !field.state.meta.isValid;
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Description
                                  </FieldLabel>
                                  <FieldDescription>
                                    Provide a brief description of the power
                                    outage.
                                  </FieldDescription>
                                  <Textarea
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) =>
                                      field.handleChange(e.target.value)
                                    }
                                    autoComplete="on"
                                    placeholder="Describe the situation.... (e.g Tree limb fell on transformer, loud pop heard)"
                                    className="resize-none"
                                  />
                                  {isInvalid && (
                                    <FieldError
                                      errors={field.state.meta.errors}
                                    />
                                  )}
                                </Field>
                              );
                            }}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
                    <div id="severity" className="flex flex-col gap-4">
                      <h1
                        className={cn(
                          "text-xl font-bold",
                          location.hash === "severity" &&
                            "bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent",
                        )}
                      >
                        4. Severity
                      </h1>
                      <form.Field
                        name="severity"
                        children={(field) => {
                          const isValid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          return (
                            <FieldSet>
                              <FieldLegend>Severity</FieldLegend>
                              <FieldDescription>
                                Select the severity of the power outage.
                              </FieldDescription>
                              <RadioGroup
                                name={field.name}
                                value={field.state.value as string}
                                onValueChange={(val) =>
                                  field.handleChange(
                                    val as "MINOR" | "MODERATE" | "SEVERE",
                                  )
                                }
                                className="flex max-md:flex-col md:flex-row overflow-x-scroll"
                              >
                                <FieldLabel htmlFor="minor">
                                  <Field orientation="horizontal">
                                    <FieldContent>
                                      <FieldTitle>
                                        <Minor className="size-6" /> Minor
                                      </FieldTitle>
                                    </FieldContent>
                                    <RadioGroupItem
                                      value={"MINOR"}
                                      id="minor"
                                      aria-invalid={isValid}
                                    />
                                  </Field>
                                </FieldLabel>
                                <FieldLabel htmlFor="moderate">
                                  <Field orientation="horizontal">
                                    <FieldContent>
                                      <FieldTitle>
                                        <Moderate className="size-6" /> Moderate
                                      </FieldTitle>
                                    </FieldContent>
                                    <RadioGroupItem
                                      value={"MODERATE"}
                                      id="moderate"
                                      aria-invalid={isValid}
                                    />
                                  </Field>
                                </FieldLabel>
                                <FieldLabel htmlFor="severe">
                                  <Field orientation="horizontal">
                                    <FieldContent>
                                      <FieldTitle>
                                        <Severe className="size-6" /> Severe
                                      </FieldTitle>
                                    </FieldContent>
                                    <RadioGroupItem
                                      value={"SEVERE"}
                                      id="severe"
                                      aria-invalid={isValid}
                                    />
                                  </Field>
                                </FieldLabel>
                              </RadioGroup>
                            </FieldSet>
                          );
                        }}
                      />
                      {/* <div className="max-md:flex-col flex gap-2">
                    <Card className="flex-1 ring-0 dark:bg-slate-800 backdrop-filter backdrop-blur-sm border dark:border-slate-700 rounded-md transition-all shadow-sm">
                      <CardHeader>
                        <Minor className="size-6" />
                      </CardHeader>
                      <CardContent>
                        <h1 className="text-lg font-semibold">Minor</h1>
                        <p className="text-muted-foreground">
                          The power is completely out in the area.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="flex-1 ring-0 dark:bg-slate-800 backdrop-filter backdrop-blur-sm border dark:border-slate-700 rounded-md transition-all shadow-sm">
                      <CardHeader>
                        <Moderate className="size-6" />
                      </CardHeader>
                      <CardContent>
                        <h1 className="text-lg font-semibold">Moderate</h1>
                        <p className="text-muted-foreground">
                          The power is partially out in the area.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="flex-1 ring-0 dark:bg-slate-800 backdrop-filter backdrop-blur-sm border dark:border-slate-700 rounded-md transition-all shadow-sm">
                      <CardHeader>
                        <Severe className="size-6" />
                      </CardHeader>
                      <CardContent>
                        <h1 className="text-lg font-semibold">Severe</h1>
                        <p className="text-muted-foreground">
                          Downed lines, sparking, or fire hazards.
                        </p>
                      </CardContent>
                    </Card>
                  </div> */}
                    </div>
                  ) : (
                    <></>
                  )}
                  {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
                    <div id="context" className="flex flex-col gap-4">
                      <h1
                        className={cn(
                          "text-xl font-bold",
                          location.hash === "context" &&
                            "bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent",
                        )}
                      >
                        5. Affected Homes Estimate
                      </h1>
                      <div className="flex gap-2">
                        <Card className="flex-1 ring-0 dark:bg-slate-800 backdrop-filter backdrop-blur-sm border dark:border-slate-700 rounded-md transition-all shadow-sm">
                          <CardContent>
                            <form.Field
                              name="affectedHomesEstimated"
                              children={(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched &&
                                  !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>
                                      Affected Homes Estimate
                                    </FieldLabel>
                                    <FieldDescription>
                                      Provide an estimate of the number of homes
                                      affected by the power outage.
                                    </FieldDescription>
                                    <Input
                                      id={field.name}
                                      name={field.name}
                                      type="number"
                                      min={1}
                                      value={field.state.value}
                                      onChange={(e) =>
                                        field.handleChange(
                                          Number(e.target.value),
                                        )
                                      }
                                      placeholder="Estimate number of affected homes (e.g. 50)"
                                    />
                                    {isInvalid && (
                                      <FieldError
                                        errors={field.state.meta.errors}
                                      />
                                    )}
                                  </Field>
                                );
                              }}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </FieldGroup>
              </form>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs sm:text-sm">
                  By submitting this report, you confirm that the information
                  provided is accurate and true.
                </p>
                <Button
                  type="submit"
                  form="report-outage-form"
                  className="rounded-md"
                >
                  Submit Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
