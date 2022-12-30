import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";

const WeeklyRepeatUI = (props) => {
  const [value, setValue] = useState([]);
  const [repeatExists, setRepeatExists] = useState(false);

  // useEffect(() => {
  //   props.passRepeatData(value);
  // }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    props.passRepeatData(value);
  };

  const handleChange = (val) => {
    setValue(val);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Label>Repeat every week on:</Form.Label>
      <ToggleButtonGroup type="checkbox" value={value} onChange={handleChange}>
        <ToggleButton variant="outline-primary" size="sm" id="Su" value={1}>
          S
        </ToggleButton>
        <ToggleButton variant="outline-primary" size="sm" id="Mo" value={2}>
          M
        </ToggleButton>
        <ToggleButton variant="outline-primary" size="sm" id="Tu" value={3}>
          T
        </ToggleButton>
        <ToggleButton variant="outline-primary" size="sm" id="We" value={4}>
          W
        </ToggleButton>
        <ToggleButton variant="outline-primary" size="sm" id="Th" value={5}>
          T
        </ToggleButton>
        <ToggleButton variant="outline-primary" size="sm" id="Fr" value={6}>
          F
        </ToggleButton>
        <ToggleButton variant="outline-primary" size="sm" id="Sa" value={7}>
          S
        </ToggleButton>
      </ToggleButtonGroup>
      <Button variant="primary mr-1" size="sm" type="submit">
        {repeatExists ? "Update" : "Create"}
      </Button>
    </Form>
  );
};

export default WeeklyRepeatUI;
